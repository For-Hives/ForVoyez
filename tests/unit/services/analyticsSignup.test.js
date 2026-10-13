import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createUserIfMissing, ensureUser } from '@/services/ensureUser.service'

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})

// The User table as PostgreSQL keeps it, clerkId being its primary key:
// - createMany with skipDuplicates is INSERT ... ON CONFLICT DO NOTHING: it
//   adds the missing rows, says how many, and never fails on an existing one;
// - upsert with an empty update returns the existing row as it is.
// Every query yields before it reads the table, so calls started together
// interleave. tests/integration/database-concurrency.test.js runs the same
// race on a real PostgreSQL.
function userTable(...rows) {
	const table = new Map(rows.map(row => [row.clerkId, row]))
	prisma.user.createMany.mockImplementation(async ({ data, skipDuplicates }) => {
		await Promise.resolve()
		let count = 0
		for (const row of data) {
			if (!table.has(row.clerkId)) {
				table.set(row.clerkId, { customerId: null, credits: 0, ...row })
				count += 1
			} else if (!skipDuplicates) {
				throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' })
			}
		}
		return { count }
	})
	prisma.user.upsert.mockImplementation(async ({ create, where }) => {
		await Promise.resolve()
		if (!table.has(where.clerkId)) table.set(where.clerkId, { customerId: null, credits: 0, ...create })
		return table.get(where.clerkId)
	})
	return table
}

describe('createUserIfMissing', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('inserts a missing user, skipping duplicates, and says it created it', async () => {
		const table = userTable()

		await expect(createUserIfMissing({ clerkId: 'user_new' })).resolves.toEqual({ created: true })

		expect(prisma.user.createMany).toHaveBeenCalledWith({ data: [{ clerkId: 'user_new' }], skipDuplicates: true })
		expect([...table.keys()]).toEqual(['user_new'])
	})

	it('creates nothing for an existing user, and leaves the row as it is', async () => {
		const existing = { clerkId: 'user_old', customerId: 42, credits: 50 }
		const table = userTable({ ...existing })

		await expect(createUserIfMissing({ clerkId: 'user_old', customerId: 7 })).resolves.toEqual({ created: false })

		expect(table.get('user_old')).toEqual(existing)
		expect(prisma.user.upsert).not.toHaveBeenCalled()
		expect(prisma.user.update).not.toHaveBeenCalled()
	})

	it('says "created" to the first call only', async () => {
		userTable()

		const first = await createUserIfMissing({ clerkId: 'user_new' })
		const second = await createUserIfMissing({ clerkId: 'user_new' })
		const third = await createUserIfMissing({ clerkId: 'user_new' })

		expect([first, second, third]).toEqual([{ created: true }, { created: false }, { created: false }])
	})

	// the race of the first visit: two tabs, a double effect, a retried request
	it('says "created" to exactly one of several first calls arriving together, and fails none', async () => {
		const table = userTable()

		const answers = await Promise.all(Array.from({ length: 12 }, () => createUserIfMissing({ clerkId: 'user_new' })))

		expect(answers.filter(answer => answer.created)).toEqual([{ created: true }])
		expect(answers.filter(answer => !answer.created)).toHaveLength(11)
		expect(table.size).toBe(1)
		// no unique-key error to recover from: nothing is read back
		expect(prisma.user.findUnique).not.toHaveBeenCalled()
	})

	it('tells the accounts apart', async () => {
		userTable({ clerkId: 'user_old', customerId: null, credits: 0 })

		const answers = await Promise.all(
			['user_a', 'user_old', 'user_b', 'user_a'].map(clerkId => createUserIfMissing({ clerkId }))
		)

		expect(answers).toEqual([{ created: true }, { created: false }, { created: true }, { created: false }])
	})

	it('answers nothing of the row', async () => {
		userTable()

		const answer = await createUserIfMissing({ clerkId: 'user_new', customerId: 42 })

		expect(Object.keys(answer)).toEqual(['created'])
	})

	// a sign-up nobody could verify is not reported
	it('lets a database failure through instead of answering', async () => {
		prisma.user.createMany.mockRejectedValue(new Error('connection failed'))

		await expect(createUserIfMissing({ clerkId: 'user_new' })).rejects.toThrow('connection failed')
	})

	it('only says "created" for one inserted row', async () => {
		prisma.user.createMany.mockResolvedValue({ count: 0 })
		await expect(createUserIfMissing({ clerkId: 'user_new' })).resolves.toEqual({ created: false })
		prisma.user.createMany.mockResolvedValue({ count: 1 })
		await expect(createUserIfMissing({ clerkId: 'user_new' })).resolves.toEqual({ created: true })
	})
})

// The webhook of a payment makes sure the row exists with ensureUser, the
// dashboard with createUserIfMissing: whichever comes first, one row, and at
// most one "created".
describe('a user reached by the webhook and by the dashboard', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('is not "created" by the dashboard when the webhook inserted the row first', async () => {
		const table = userTable()

		const row = await ensureUser({ clerkId: 'user_paid', customerId: 42 })
		const answer = await createUserIfMissing({ clerkId: 'user_paid' })

		expect(answer).toEqual({ created: false })
		expect(table.size).toBe(1)
		expect(table.get('user_paid')).toBe(row)
		expect(row).toEqual({ clerkId: 'user_paid', customerId: 42, credits: 0 })
	})

	it('is "created" by the dashboard, then left as it is by the webhook', async () => {
		const table = userTable()

		const answer = await createUserIfMissing({ clerkId: 'user_new' })
		table.get('user_new').credits = 50
		const row = await ensureUser({ clerkId: 'user_new', customerId: 42 })

		expect(answer).toEqual({ created: true })
		expect(table.size).toBe(1)
		expect(row).toEqual({ clerkId: 'user_new', customerId: null, credits: 50 })
	})

	it('is "created" at most once when both arrive together', async () => {
		const table = userTable()

		const [answers] = await Promise.all([
			Promise.all(Array.from({ length: 6 }, () => createUserIfMissing({ clerkId: 'user_new' }))),
			Promise.all(Array.from({ length: 3 }, () => ensureUser({ clerkId: 'user_new', customerId: 42 }))),
		])

		expect(answers.filter(answer => answer.created).length).toBeLessThanOrEqual(1)
		expect(table.size).toBe(1)
	})
})

// unchanged, and still what the webhook relies on
describe('ensureUser', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('upserts without changing an existing row, and returns the row', async () => {
		prisma.user.upsert.mockResolvedValue({ clerkId: 'user123', customerId: 42 })

		await expect(ensureUser({ clerkId: 'user123', customerId: 7 })).resolves.toEqual({
			clerkId: 'user123',
			customerId: 42,
		})
		expect(prisma.user.upsert).toHaveBeenCalledWith({
			create: { clerkId: 'user123', customerId: 7 },
			where: { clerkId: 'user123' },
			update: {},
		})
		expect(prisma.user.createMany).not.toHaveBeenCalled()
	})

	it('returns the existing user when another request wins the insertion race', async () => {
		prisma.user.upsert.mockRejectedValue(Object.assign(new Error('duplicate'), { code: 'P2002' }))
		prisma.user.findUnique.mockResolvedValue({ clerkId: 'user123' })

		await expect(ensureUser({ clerkId: 'user123' })).resolves.toEqual({ clerkId: 'user123' })
		expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { clerkId: 'user123' } })
	})

	it('propagates failures other than a confirmed competing insertion', async () => {
		prisma.user.upsert.mockRejectedValue(new Error('connection failed'))
		await expect(ensureUser({ clerkId: 'user123' })).rejects.toThrow('connection failed')
		expect(prisma.user.findUnique).not.toHaveBeenCalled()
		prisma.user.upsert.mockRejectedValue(Object.assign(new Error('duplicate'), { code: 'P2002' }))
		prisma.user.findUnique.mockResolvedValue(null)
		await expect(ensureUser({ clerkId: 'user123' })).rejects.toThrow('duplicate')
	})
})
