import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as clerk from '@clerk/nextjs/server'

import {
	decrementCredit,
	getCreditsFromUserId,
	getCurrentUser,
	getCustomerIdFromUser,
	getPlans,
	getSubscriptionFromUserId,
	getUsageByToken,
	getUsageForUser,
	syncPlans,
	updateCredits,
} from '@/services/database.service'
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
		it('should log an error if variant ID is undefined', async () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {})

			ls.listProducts.mockResolvedValue([
				{
					relationships: {
						variants: {
							data: [{ id: undefined }],
						},
					},
					attributes: { name: 'Product1' },
				},
			])
			ls.getVariant.mockResolvedValue({
				data: {
					attributes: {
						is_subscription: false,
						product_id: 'product1',
						name: 'Variant1',
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

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Variant ID is undefined for variant:',
				expect.any(Object)
			)

			consoleErrorSpy.mockRestore()
		})

		it('should continue if product relationships variants data is missing', async () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {})

			ls.listProducts.mockResolvedValue([
				{
					attributes: { name: 'Product1' },
					relationships: {},
				},
			])

			await syncPlans()

			expect(ls.getVariant).not.toHaveBeenCalled()

			consoleErrorSpy.mockRestore()
		})

		it('should continue if variant details attributes are missing', async () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {})

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
					data: {},
				},
			})

			await syncPlans()

			expect(ls.listPrice).not.toHaveBeenCalled()

			consoleErrorSpy.mockRestore()
		})

		it('should log an error if currentPriceObj or its attributes are missing', async () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {})

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
					attributes: {
						is_subscription: false,
						product_id: 'product1',
						name: 'Variant1',
					},
				},
			})
			ls.listPrice.mockResolvedValue([{}])

			await syncPlans()

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Price object is missing attributes:',
				expect.any(Object)
			)

			consoleErrorSpy.mockRestore()
		})

		it('should log and throw an error if an exception occurs during sync', async () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {})
			const mockError = new Error('Sync error')

			ls.listProducts.mockRejectedValue(mockError)

			await expect(syncPlans()).rejects.toThrow('Sync error')

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Error syncing plans:',
				mockError
			)

			consoleErrorSpy.mockRestore()
		})

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
					attributes: {
						is_subscription: false,
						product_id: 'product1',
						name: 'Variant1',
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

			const mockUser = { id: 'user123', credits: 0 }
			prisma.user.findUnique.mockResolvedValue(mockUser)

			await updateCredits(userId, credits, tokenId, reason)

			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { clerkId: userId },
				data: { credits: 10 },
			})
			expect(prisma.usage.create).toHaveBeenCalledWith({
				data: {
					previousCredits: 0,
					currentCredits: 10,
					userId: userId,
					used: credits,
					tokenId,
					reason,
				},
			})
		})

		it('should throw an error for invalid credits value', async () => {
			await expect(
				updateCredits('user123', 'invalid', 'token123', 'test')
			).rejects.toThrow('Invalid credits value')
		})

		it('should throw an error if the user is not found', async () => {
			prisma.user.findUnique.mockResolvedValue(null)

			await expect(
				updateCredits('user123', 10, 'token123', 'test')
			).rejects.toThrow('User not found')
		})
	})

	describe('decrementCredit', () => {
		it('should decrement the credits of the authenticated user', async () => {
			const mockUser = { id: 'user123', credits: 10 }
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.user.findUnique.mockResolvedValue(mockUser)

			await decrementCredit('test reason')

			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { clerkId: mockUser.id },
				data: { credits: 9 },
			})
		})
	})

	describe('getUsageForUser', () => {
		it('should return usage data for the authenticated user', async () => {
			const mockUser = { id: 'user123', credits: 10 }
			const mockUsageData = [
				{
					usedAt: new Date('2024-06-04T10:53:49.301Z'),
					previousCredits: 10,
					used: 10,
				},
				{
					usedAt: new Date('2024-06-04T11:53:49.301Z'),
					previousCredits: 8,
					used: 8,
				},
			]
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.usage.findMany.mockResolvedValue(mockUsageData)
			prisma.user.findFirst.mockResolvedValue(mockUser)

			const usage = await getUsageForUser()

			expect(usage).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						fullDate: new Date('2024-06-04T10:53:49.301Z'),
						dateHour: '2024-06-04T10',
						creditsLeft: 10,
					}),
					expect.objectContaining({
						fullDate: new Date('2024-06-04T11:53:49.301Z'),
						dateHour: '2024-06-04T11',
						creditsLeft: 8,
					}),
				])
			)
		})

		it('should update creditsLeft when dateHour already exists', async () => {
			const mockUser = { id: 'user123', credits: 10 }
			const mockUsageData = [
				{
					usedAt: new Date('2024-06-04T10:53:49.301Z'),
					previousCredits: 10,
					used: 2,
				},
				{
					usedAt: new Date('2024-06-04T10:55:49.301Z'),
					previousCredits: 8,
					used: 1,
				},
			]
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.usage.findMany.mockResolvedValue(mockUsageData)
			prisma.user.findFirst.mockResolvedValue(mockUser)

			const usage = await getUsageForUser()

			expect(usage).toEqual([
				expect.objectContaining({
					fullDate: new Date('2024-06-04T10:53:49.301Z'),
					dateHour: '2024-06-04T10',
					creditsLeft: 8,
				}),
			])
		})

		it('should return hourlyUsageArray when its length is less than or equal to 5', async () => {
			const mockUser = { id: 'user123', credits: 10 }
			const mockUsageData = [
				{
					usedAt: new Date('2024-06-04T10:53:49.301Z'),
					previousCredits: 10,
					used: 2,
				},
				{
					usedAt: new Date('2024-06-04T11:53:49.301Z'),
					previousCredits: 8,
					used: 1,
				},
				{
					usedAt: new Date('2024-06-04T12:53:49.301Z'),
					previousCredits: 7,
					used: 1,
				},
			]
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.usage.findMany.mockResolvedValue(mockUsageData)
			prisma.user.findFirst.mockResolvedValue(mockUser)

			const usage = await getUsageForUser()

			expect(usage.length).toBeLessThanOrEqual(5)
		})

		it('should return hourlyUsageArray when its length is greater than 5', async () => {
			const mockUser = { id: 'user123', credits: 10 }
			const mockUsageData = Array.from({ length: 10 }, (_, i) => ({
				usedAt: new Date(`2024-06-04T${10 + i}:53:49.301Z`),
				previousCredits: 10 - i,
				used: 1,
			}))
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.usage.findMany.mockResolvedValue(mockUsageData)
			prisma.user.findFirst.mockResolvedValue(mockUser)

			const usage = await getUsageForUser()

			expect(usage.length).toBeGreaterThan(5)
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.currentUser.mockResolvedValue(null)

			await expect(getUsageForUser()).rejects.toThrow('User not authenticated')
		})

		it('should throw an error if user credits are not found', async () => {
			const mockUser = { id: 'user123' }
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.user.findFirst.mockResolvedValue({ credits: null })

			await expect(getUsageForUser()).rejects.toThrow('User credits not found')
		})

		it('should return an empty array if there is no usage data', async () => {
			const mockUser = { id: 'user123', credits: 10 }
			clerk.currentUser.mockResolvedValue(mockUser)
			prisma.usage.findMany.mockResolvedValue([])
			prisma.user.findFirst.mockResolvedValue(mockUser)

			const usage = await getUsageForUser()

			expect(usage).toEqual([])
		})
	})

	describe('getUsageByToken', () => {
		it('should return usage data grouped by token for the authenticated user', async () => {
			const mockUser = { id: 'user123' }
			const mockUsageData = [
				{ token: { name: 'Token1' }, userId: 'user123' },
				{
					token: { name: 'Token1' },
					userId: 'user123',
				},
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
