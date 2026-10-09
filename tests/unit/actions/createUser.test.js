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

describe('createUser', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('should throw an error if the user is not authenticated', async () => {
		auth.mockResolvedValue({ userId: null })

		await expect(createUser()).rejects.toThrow('You must be logged to create a user')
	})

	it('should return the existing user if a user with the same clerkId already exists', async () => {
		const mockUser = { id: 'user123' }
		const mockExistingUser = { clerkId: 'user123', id: 'dbUser123' }

		auth.mockResolvedValue({ userId: mockUser.id })
		prisma.user.upsert.mockResolvedValue(mockExistingUser)

		const user = await createUser()

		expect(user).toEqual(mockExistingUser)
		expect(prisma.user.upsert).toHaveBeenCalledWith({
			where: { clerkId: 'user123' },
			update: {},
			create: { clerkId: 'user123', updatedAt: expect.any(String) },
		})
	})

	it('should create and return a new user if no user with the same clerkId exists', async () => {
		const mockUser = { id: 'user123' }
		const mockNewUser = { clerkId: 'user123', id: 'newUser123' }

		auth.mockResolvedValue({ userId: mockUser.id })
		prisma.user.upsert.mockResolvedValue(mockNewUser)

		const user = await createUser()

		expect(user).toEqual(mockNewUser)
		expect(prisma.user.upsert).toHaveBeenCalledWith({
			where: { clerkId: 'user123' },
			update: {},
			create: {
				updatedAt: expect.any(String),
				clerkId: 'user123',
			},
		})
	})
	it('returns the existing user when another request wins the insertion race', async () => {
		auth.mockResolvedValue({ userId: 'user123' })
		prisma.user.upsert.mockRejectedValue(Object.assign(new Error('duplicate'), { code: 'P2002' }))
		prisma.user.findUnique.mockResolvedValue({ clerkId: 'user123' })
		await expect(createUser()).resolves.toEqual({ clerkId: 'user123' })
		expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { clerkId: 'user123' } })
	})

	it('propagates failures other than a confirmed competing insertion', async () => {
		auth.mockResolvedValue({ userId: 'user123' })
		prisma.user.upsert.mockRejectedValue(new Error('connection failed'))
		await expect(createUser()).rejects.toThrow('connection failed')
		expect(prisma.user.findUnique).not.toHaveBeenCalled()
		prisma.user.upsert.mockRejectedValue(Object.assign(new Error('duplicate'), { code: 'P2002' }))
		prisma.user.findUnique.mockResolvedValue(null)
		await expect(createUser()).rejects.toThrow('duplicate')
	})
})
