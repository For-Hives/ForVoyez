import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as clerk from '@clerk/nextjs/server'

import {
	getCreditsFromUserId,
	getUsageByToken,
	getUsageForUser,
} from '@/services/database.service'

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('@clerk/nextjs/server')
vi.mock('@/services/lemonsqueezy.service')
vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})

// Usage rows as chargeOneCredit and updateCredits write them: previousCredits
// is the balance before the operation, currentCredits the one after it.
const ROWS_DOWN_TO_ZERO = [
	{
		usedAt: new Date('2026-10-01T09:10:00.000Z'),
		reason: 'Order created',
		previousCredits: 0,
		currentCredits: 2,
		tokenId: null,
		used: 2,
	},
	{
		usedAt: new Date('2026-10-01T09:20:00.000Z'),
		reason: 'describe from PlaygroundAction',
		previousCredits: 2,
		currentCredits: 1,
		tokenId: null,
		used: -1,
	},
	{
		reason: 'decrement token from Describe Action',
		usedAt: new Date('2026-10-02T14:30:00.000Z'),
		previousCredits: 1,
		tokenId: 'token-1',
		currentCredits: 0,
		used: -1,
	},
]

describe('usage dashboard at 0 credits', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		clerk.auth.mockResolvedValue({ userId: 'user123' })
	})

	describe('getUsageForUser', () => {
		it('should return the history of a user with 0 credits left', async () => {
			prisma.user.findFirst.mockResolvedValue({
				clerkId: 'user123',
				credits: 0,
			})
			prisma.usage.findMany.mockResolvedValue(ROWS_DOWN_TO_ZERO)

			const usage = await getUsageForUser()

			expect(usage).toHaveLength(2)
			expect(usage.at(-1).creditsLeft).toBe(0)
			expect(prisma.usage.findMany).toHaveBeenCalledWith({
				where: { userId: 'user123' },
				orderBy: { usedAt: 'asc' },
			})
		})

		it('should not depend on the balance (no User lookup)', async () => {
			prisma.usage.findMany.mockResolvedValue(ROWS_DOWN_TO_ZERO)

			await expect(getUsageForUser()).resolves.toHaveLength(2)
			expect(prisma.user.findFirst).not.toHaveBeenCalled()
			expect(prisma.user.findUnique).not.toHaveBeenCalled()
		})

		it('should chart the balance after the last operation of each hour', async () => {
			prisma.usage.findMany.mockResolvedValue(ROWS_DOWN_TO_ZERO)

			const usage = await getUsageForUser()

			expect(usage).toEqual([
				{
					fullDate: new Date('2026-10-01T09:20:00.000Z'),
					dateHour: '2026-10-01T09',
					creditsLeft: 1,
				},
				{
					fullDate: new Date('2026-10-02T14:30:00.000Z'),
					dateHour: '2026-10-02T14',
					creditsLeft: 0,
				},
			])
		})

		it('should show the new balance right after a purchase', async () => {
			prisma.usage.findMany.mockResolvedValue([ROWS_DOWN_TO_ZERO[0]])

			const usage = await getUsageForUser()

			expect(usage).toEqual([
				expect.objectContaining({ dateHour: '2026-10-01T09', creditsLeft: 2 }),
			])
		})

		it('should not call the Clerk Backend API', async () => {
			prisma.usage.findMany.mockResolvedValue([])

			await getUsageForUser()

			expect(clerk.currentUser).not.toHaveBeenCalled()
		})
	})

	describe('getUsageByToken', () => {
		it('should count only the charged operations, whatever the balance', async () => {
			prisma.usage.findMany.mockResolvedValue([
				{ token: null, used: -1 },
				{ token: { name: 'WordPress' }, used: -1 },
				{ token: { name: 'WordPress' }, used: -1 },
			])

			const usageByToken = await getUsageByToken()

			expect(usageByToken).toEqual([
				{ token: 'Playground', used: 1 },
				{ token: 'WordPress', used: 2 },
			])
			// purchases and renewals (used > 0, no token) are not Playground uses
			expect(prisma.usage.findMany).toHaveBeenCalledWith({
				where: { userId: 'user123', used: { lt: 0 } },
				include: { token: true },
			})
		})
	})

	describe('getCreditsFromUserId', () => {
		it('should return 0, not undefined, when the User row does not exist yet', async () => {
			prisma.user.findFirst.mockResolvedValue(null)

			await expect(getCreditsFromUserId()).resolves.toBe(0)
		})

		it('should return a 0 balance as 0', async () => {
			prisma.user.findFirst.mockResolvedValue({
				clerkId: 'user123',
				credits: 0,
			})

			await expect(getCreditsFromUserId()).resolves.toBe(0)
			expect(prisma.user.findFirst).toHaveBeenCalledWith({
				where: { clerkId: 'user123' },
			})
		})
	})
})
