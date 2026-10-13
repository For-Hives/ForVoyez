import { auth, currentUser } from '@clerk/nextjs/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createUser } from '@/app/actions/app/createUser'
import { saveWebhooks } from '@/services/webhook.service'

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('@clerk/nextjs/server')
vi.mock('@/services/database.service')
vi.mock('@/services/logger.service', () => ({ logger: { info: vi.fn() } }))
vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})

// a Clerk user id: it identifies the visitor, so it stays on the server
const CLERK_ID = 'user_2abcDEF123'

// The User table as PostgreSQL keeps it (see the same helper in
// tests/unit/services/analyticsSignup.test.js): the dashboard inserts with
// INSERT ... ON CONFLICT DO NOTHING, the webhook with an upsert that changes
// nothing, and every query yields so that calls started together interleave.
function userTable() {
	const table = new Map()
	prisma.user.createMany.mockImplementation(async ({ data }) => {
		await Promise.resolve()
		const missing = data.filter(row => !table.has(row.clerkId))
		for (const row of missing) table.set(row.clerkId, { customerId: null, credits: 0, ...row })
		return { count: missing.length }
	})
	prisma.user.upsert.mockImplementation(async ({ create, where }) => {
		await Promise.resolve()
		if (!table.has(where.clerkId)) table.set(where.clerkId, { customerId: null, credits: 0, ...create })
		return table.get(where.clerkId)
	})
	prisma.webhookEvent.create.mockResolvedValue({ id: 1 })
	return table
}

function paidOrderOf(userId) {
	return {
		data: { attributes: { customer_id: 42, status: 'paid' }, type: 'orders', id: 'order-1' },
		meta: { custom_data: { user_id: userId }, event_name: 'order_created' },
	}
}

describe('createUser, the sign-up signal of the dashboard', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		auth.mockResolvedValue({ userId: CLERK_ID })
	})

	it('answers created: true on the first arrival of a new account', async () => {
		const table = userTable()

		await expect(createUser()).resolves.toEqual({ created: true })

		expect(table.get(CLERK_ID)).toMatchObject({ clerkId: CLERK_ID, credits: 0 })
	})

	it('answers created: false for an account that already has its row', async () => {
		const table = userTable()
		table.set(CLERK_ID, { clerkId: CLERK_ID, customerId: 42, credits: 50 })

		await expect(createUser()).resolves.toEqual({ created: false })

		expect(table.get(CLERK_ID)).toEqual({ clerkId: CLERK_ID, customerId: 42, credits: 50 })
	})

	it('answers created: true once when the action is called twice', async () => {
		userTable()

		const first = await createUser()
		const second = await createUser()

		expect([first, second]).toEqual([{ created: true }, { created: false }])
	})

	// two tabs opened after the sign-up, or an effect that ran twice
	it('answers created: true once when the action is called twice at the same time', async () => {
		const table = userTable()

		const answers = await Promise.all([createUser(), createUser()])

		expect(answers.filter(answer => answer.created)).toHaveLength(1)
		expect(table.size).toBe(1)
	})

	it('counts every account once, whoever arrives when', async () => {
		userTable()
		const visits = ['user_a', 'user_b', 'user_a', 'user_c', 'user_b', 'user_a']
		for (const userId of visits) auth.mockResolvedValueOnce({ userId })

		const answers = await Promise.all(visits.map(() => createUser()))

		expect(answers.filter(answer => answer.created)).toHaveLength(3)
	})

	it('sends the browser a boolean and nothing of the row', async () => {
		userTable()

		const answer = await createUser()

		expect(Object.keys(answer)).toEqual(['created'])
		expect(answer.created).toBe(true)
		expect(JSON.stringify(answer)).not.toContain(CLERK_ID)
	})

	it('answers nothing to a signed-out caller, and does not touch the database', async () => {
		userTable()
		auth.mockResolvedValue({ userId: null })

		await expect(createUser()).rejects.toThrow('You must be logged to create a user')

		expect(prisma.user.createMany).not.toHaveBeenCalled()
		expect(prisma.user.upsert).not.toHaveBeenCalled()
	})

	it('reports no sign-up when the database fails', async () => {
		prisma.user.createMany.mockRejectedValue(new Error('connection failed'))

		await expect(createUser()).rejects.toThrow('connection failed')
	})

	it('reads the session and never calls the Clerk API', async () => {
		userTable()

		await createUser()

		expect(auth).toHaveBeenCalledTimes(1)
		expect(currentUser).not.toHaveBeenCalled()
	})
})

// The webhook of a payment creates the row itself when the dashboard could not
// (saveWebhooks). Such an account is not reported as a sign-up later: its row
// exists, and nothing in it says whether the dashboard ever saw it.
describe('an account whose row the webhook created', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		auth.mockResolvedValue({ userId: CLERK_ID })
	})

	it('is not a sign-up at its next arrival in the dashboard, and keeps what the webhook stored', async () => {
		const table = userTable()

		await saveWebhooks(paidOrderOf(CLERK_ID))
		const answer = await createUser()

		expect(answer).toEqual({ created: false })
		expect(table.get(CLERK_ID)).toEqual({ clerkId: CLERK_ID, customerId: 42, credits: 0 })
	})

	it('was already counted when the dashboard came first', async () => {
		const table = userTable()

		const answer = await createUser()
		await saveWebhooks(paidOrderOf(CLERK_ID))
		const later = await createUser()

		expect([answer, later]).toEqual([{ created: true }, { created: false }])
		expect(table.size).toBe(1)
		// the webhook does not overwrite the row the dashboard created
		expect(table.get(CLERK_ID).customerId).toBeNull()
	})

	it('is counted at most once when the dashboard and the webhook arrive together', async () => {
		const table = userTable()

		const [first, , second] = await Promise.all([createUser(), saveWebhooks(paidOrderOf(CLERK_ID)), createUser()])

		expect([first, second].filter(answer => answer.created).length).toBeLessThanOrEqual(1)
		expect(table.size).toBe(1)
	})
})
