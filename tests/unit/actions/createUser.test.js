import { auth } from '@clerk/nextjs/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createUser } from '@/app/actions/app/createUser'

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})

vi.mock('@clerk/nextjs/server')

// the insertion that skips an existing row: INSERT ... ON CONFLICT DO NOTHING
const INSERT_IF_MISSING = {
	data: [{ clerkId: 'user123', updatedAt: expect.any(String) }],
	skipDuplicates: true,
}

describe('createUser', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('should throw an error if the user is not authenticated', async () => {
		auth.mockResolvedValue({ userId: null })

		await expect(createUser()).rejects.toThrow('You must be logged to create a user')
		expect(prisma.user.createMany).not.toHaveBeenCalled()
	})

	it('should leave the existing user as it is if a user with the same clerkId already exists', async () => {
		auth.mockResolvedValue({ userId: 'user123' })
		prisma.user.createMany.mockResolvedValue({ count: 0 })

		const answer = await createUser()

		expect(answer).toEqual({ created: false })
		expect(prisma.user.createMany).toHaveBeenCalledWith(INSERT_IF_MISSING)
		expect(prisma.user.upsert).not.toHaveBeenCalled()
		expect(prisma.user.update).not.toHaveBeenCalled()
	})

	it('should create a new user if no user with the same clerkId exists', async () => {
		auth.mockResolvedValue({ userId: 'user123' })
		prisma.user.createMany.mockResolvedValue({ count: 1 })

		const answer = await createUser()

		expect(answer).toEqual({ created: true })
		expect(prisma.user.createMany).toHaveBeenCalledTimes(1)
		expect(prisma.user.createMany).toHaveBeenCalledWith(INSERT_IF_MISSING)
	})

	// PostgreSQL makes the loser of the race wait, then skip its row: it gets
	// no unique-key error to recover from
	it('succeeds without creating when another request wins the insertion race', async () => {
		auth.mockResolvedValue({ userId: 'user123' })
		prisma.user.createMany.mockResolvedValue({ count: 0 })

		await expect(createUser()).resolves.toEqual({ created: false })
		expect(prisma.user.findUnique).not.toHaveBeenCalled()
	})

	it('propagates the failures of the database', async () => {
		auth.mockResolvedValue({ userId: 'user123' })
		prisma.user.createMany.mockRejectedValue(new Error('connection failed'))
		await expect(createUser()).rejects.toThrow('connection failed')
		prisma.user.createMany.mockRejectedValue(Object.assign(new Error('duplicate'), { code: 'P2002' }))
		await expect(createUser()).rejects.toThrow('duplicate')
	})
})
