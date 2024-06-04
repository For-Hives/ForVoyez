import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as clerk from '@clerk/nextjs/server'

import {
	TestingExports,
	decrementCredit,
	getCreditsFromUserId,
	getCustomerIdFromUser,
	getPlans,
	getSubscriptionFromUserId,
	getUsageByToken,
	getUsageForUser,
	syncPlans,
	updateCredits,
} from '@/services/database.service'

const { getCurrentUser } = TestingExports

import * as ls from '@/services/lemonsqueezy.service'

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('@clerk/nextjs/server')
vi.mock('@/services/lemonsqueezy.service')
vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})

describe('Database Service', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	describe('getCurrentUser', () => {
		it('should return the current user', async () => {
			const mockUser = { id: 'user123' }
			clerk.currentUser.mockResolvedValue(mockUser)

			const user = await getCurrentUser()

			expect(user).toBe(mockUser)
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.currentUser.mockResolvedValue(null)

			await expect(getCurrentUser()).rejects.toThrow('User not authenticated')
		})
	})

	describe('getPlans', () => {
		it('should return all plans if no filter is provided', async () => {
			const mockPlans = [{ billingCycle: 'monthly', id: 1 }]
			prisma.plan.findMany.mockResolvedValue(mockPlans)
			ls.listProducts.mockResolvedValue([])
			ls.getVariant.mockResolvedValue({
				data: { data: { attributes: {} } },
			})

			const plans = await getPlans()

			expect(plans).toBe(mockPlans)
		})

		it('should return filtered plans if a filter is provided', async () => {
			const mockPlans = [
				{ billingCycle: 'monthly', id: 1 },
				{ billingCycle: 'yearly', id: 2 },
			]
			prisma.plan.findMany.mockResolvedValue(mockPlans)

			const plans = await getPlans('monthly')

			expect(plans).toEqual([mockPlans[0]])
		})
	})

	describe('syncPlans', () => {
		it('should sync plans with Lemon Squeezy', async () => {
			ls.initLemonSqueezy.mockResolvedValue()
			ls.listProducts.mockResolvedValue([
				{
					relationships: {
						variants: {
							data: [{ id: 'variant1' }],
						},
					},
					attributes: { name: 'Product1' },
				},
			])
			ls.getVariant.mockResolvedValue({
				data: {
					data: {
						attributes: {
							is_subscription: false,
							product_id: 'product1',
							name: 'Variant1',
						},
					},
				},
			})
			ls.listPrice.mockResolvedValue([
				{
					attributes: {
						usage_aggregation: null,
						unit_price: 100,
					},
				},
			])

			await syncPlans()

			expect(ls.listProducts).toHaveBeenCalled()
			expect(prisma.plan.upsert).toHaveBeenCalledWith({
				update: {
					productName: 'Product1',
					description: undefined,
					packageSize: undefined,
					productId: 'product1',
					variantId: 'variant1',
					variantEnabled: true,
					billingCycle: null,
					name: 'Variant1',
					price: 100,
				},
				create: {
					productName: 'Product1',
					description: undefined,
					packageSize: undefined,
					productId: 'product1',
					variantId: 'variant1',
					variantEnabled: true,
					billingCycle: null,
					name: 'Variant1',
					price: 100,
				},
				where: { variantId: 'variant1' },
			})
		})
	})

	describe('getCustomerIdFromUser', () => {
		it('should return the customer ID of the authenticated user', async () => {
			const mockUser = { id: 'user123' }
			const mockSubscription = { customerId: 'customer123' }
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.subscription.findFirst.mockResolvedValue(mockSubscription)

			const customerId = await getCustomerIdFromUser()

			expect(customerId).toBe('customer123')
		})

		it('should return null if the user has no subscription', async () => {
			const mockUser = { id: 'user123' }
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.subscription.findFirst.mockResolvedValue(null)

			const customerId = await getCustomerIdFromUser()

			expect(customerId).toBeNull()
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.currentUser.mockResolvedValue(null)

			await expect(getCustomerIdFromUser()).rejects.toThrow(
				'User not authenticated'
			)
		})
	})

	describe('updateCredits', () => {
		it('should update the user credits and create a usage entry', async () => {
			const userId = 'user123'
			const credits = 10
			const tokenId = 'token123'
			const reason = 'test'

			await updateCredits(userId, credits, tokenId, reason)

			expect(prisma.user.update).toHaveBeenCalledWith({
				data: { credits: { increment: credits } },
				where: { clerkId: userId },
			})
			expect(prisma.usage.create).toHaveBeenCalledWith({
				data: {
					used: credits,
					tokenId,
					userId,
					reason,
				},
			})
		})

		it('should throw an error for invalid credits value', async () => {
			await expect(
				updateCredits('user123', 'invalid', 'token123', 'test')
			).rejects.toThrow('Invalid credits value')
		})
	})

	describe('decrementCredit', () => {
		it('should decrement the credits of the authenticated user', async () => {
			const mockUser = { id: 'user123' }
			clerk.currentUser.mockResolvedValue(mockUser)

			await decrementCredit('test reason')

			expect(prisma.user.update).toHaveBeenCalledWith({
				data: { credits: { increment: -1 } },
				where: { clerkId: mockUser.id },
			})
		})
	})

	describe('getUsageForUser', () => {
		it('should return usage data for the authenticated user', async () => {
			const mockUser = { id: 'user123', credits: 10 }
			const mockUsageData = [
				{ usedAt: new Date(), used: 10 },
				{ usedAt: new Date(), used: 8 },
			]
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.usage.findMany.mockResolvedValue(mockUsageData)

			const usage = await getUsageForUser()

			expect(usage).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ creditsLeft: 10 }),
					expect.objectContaining({ creditsLeft: 8 }),
				])
			)
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.currentUser.mockResolvedValue(null)

			await expect(getUsageForUser()).rejects.toThrow('User not authenticated')
		})
	})

	describe('getUsageByToken', () => {
		it('should return usage data grouped by token for the authenticated user', async () => {
			const mockUser = { id: 'user123' }
			const mockUsageData = [
				{ token: { name: 'Token1' }, userId: 'user123' },
				{ token: { name: 'Token1' }, userId: 'user123' },
				{ token: { name: 'Token2' }, userId: 'user123' },
			]
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.usage.findMany.mockResolvedValue(mockUsageData)

			const usageByToken = await getUsageByToken()

			expect(usageByToken).toEqual([
				{ token: 'Token1', used: 2 },
				{ token: 'Token2', used: 1 },
			])
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.currentUser.mockResolvedValue(null)

			await expect(getUsageByToken()).rejects.toThrow('User not authenticated')
		})
	})

	describe('getSubscriptionFromUserId', () => {
		it('should return the subscription of the authenticated user', async () => {
			const mockUser = { id: 'user123' }
			const mockSubscription = { id: 'sub123', plan: {} }
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.subscription.findFirst.mockResolvedValue(mockSubscription)

			const subscription = await getSubscriptionFromUserId()

			expect(subscription).toBe(mockSubscription)
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.currentUser.mockResolvedValue(null)

			await expect(getSubscriptionFromUserId()).rejects.toThrow(
				'User not authenticated'
			)
		})
	})

	describe('getCreditsFromUserId', () => {
		it('should return the credits of the authenticated user', async () => {
			const mockUser = { id: 'user123' }
			const mockConnectedUser = { credits: 100 }
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.user.findFirst.mockResolvedValue(mockConnectedUser)

			const credits = await getCreditsFromUserId()

			expect(credits).toBe(100)
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.currentUser.mockResolvedValue(null)

			await expect(getCreditsFromUserId()).rejects.toThrow(
				'User not authenticated'
			)
		})
	})
})
