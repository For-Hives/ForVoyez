import * as clerk from '@clerk/nextjs/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
	chargeOneCredit,
	findActiveApiToken,
	getCreditsFromUserId,
	getCurrentUser,
	getCustomerIdFromUser,
	getPlans,
	getSubscriptionFromUserId,
	getUsageByToken,
	getUsageForUser,
	NoCreditsLeftError,
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

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Keep the existing component or test scenario together during the tooling migration.
describe('Database Service', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	describe('getCurrentUser', () => {
		it('should return the session user id without calling the Clerk API', async () => {
			clerk.auth.mockResolvedValue({ userId: 'user123' })

			const user = await getCurrentUser()

			expect(user).toEqual({ id: 'user123' })
			expect(clerk.currentUser).not.toHaveBeenCalled()
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.auth.mockResolvedValue({ userId: null })

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
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

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

			expect(consoleErrorSpy).toHaveBeenCalledWith('Variant ID is undefined for variant:', expect.any(Object))

			consoleErrorSpy.mockRestore()
		})

		it('should continue if product relationships variants data is missing', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

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
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

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
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

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

			expect(consoleErrorSpy).toHaveBeenCalledWith('Price object is missing attributes:', expect.any(Object))

			consoleErrorSpy.mockRestore()
		})

		it('should log and throw an error if an exception occurs during sync', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
			const mockError = new Error('Sync error')

			ls.listProducts.mockRejectedValue(mockError)

			await expect(syncPlans()).rejects.toThrow('Sync error')

			expect(consoleErrorSpy).toHaveBeenCalledWith('Error syncing plans:', mockError)

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
			const mockSubscription = { customerId: '42', userId: 'user123' }
			clerk.auth.mockResolvedValue({ userId: mockUser.id })
			prisma.subscription.findFirst.mockResolvedValue(mockSubscription)

			const customerId = await getCustomerIdFromUser()

			expect(customerId).toBe('42')
		})

		it('should return null if the user has no subscription', async () => {
			const mockUser = { id: 'user123' }
			clerk.auth.mockResolvedValue({ userId: mockUser.id })
			prisma.subscription.findFirst.mockResolvedValue(null)

			const customerId = await getCustomerIdFromUser()

			expect(customerId).toBeNull()
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.auth.mockResolvedValue({ userId: null })

			await expect(getCustomerIdFromUser()).rejects.toThrow('User not authenticated')
		})
	})

	describe('updateCredits', () => {
		it('should add the credits atomically and create a usage entry', async () => {
			const userId = 'user123'
			const credits = 10
			const tokenId = 'token123'
			const reason = 'test'

			const mockToken = { id: 'token123' }

			prisma.user.findUnique.mockResolvedValue({ clerkId: userId })
			prisma.user.update.mockResolvedValue({ credits: 10 })
			prisma.token.findFirst.mockResolvedValue(mockToken)

			await updateCredits(userId, credits, tokenId, reason)

			// `credits = credits + n` in the database, not a value computed here
			expect(prisma.user.update).toHaveBeenCalledWith({
				data: { credits: { increment: 10 } },
				where: { clerkId: userId },
				select: { credits: true },
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
			await expect(updateCredits('user123', 'invalid', 'token123', 'test')).rejects.toThrow('Invalid credits value')
		})

		it('should throw an error if the user is not found', async () => {
			prisma.user.findUnique.mockResolvedValue(null)

			await expect(updateCredits('user123', 10, 'token123', 'test')).rejects.toThrow('User not found')
			expect(prisma.user.update).not.toHaveBeenCalled()
		})
	})

	describe('chargeOneCredit', () => {
		const usage = { reason: 'test reason', tokenId: 'token-1' }

		beforeEach(() => {
			prisma.$transaction.mockImplementation(queries => Promise.all(queries))
		})

		it('should reserve one credit with a conditional decrement, then record the usage', async () => {
			prisma.user.updateMany.mockResolvedValue({ count: 1 })
			prisma.user.findUnique.mockResolvedValue({ credits: 4 })
			const work = vi.fn().mockResolvedValue('result')

			await expect(chargeOneCredit('user123', usage, work)).resolves.toBe('result')

			expect(prisma.user.updateMany).toHaveBeenCalledWith({
				where: { credits: { gte: 1 }, clerkId: 'user123' },
				data: { credits: { decrement: 1 } },
			})
			// reservation happens before the paid work
			expect(prisma.user.updateMany.mock.invocationCallOrder[0]).toBeLessThan(work.mock.invocationCallOrder[0])
			expect(prisma.usage.create).toHaveBeenCalledWith({
				data: {
					reason: 'test reason',
					previousCredits: 5,
					tokenId: 'token-1',
					userId: 'user123',
					currentCredits: 4,
					used: -1,
				},
			})
		})

		it('should throw NoCreditsLeftError and skip the work when no credit can be reserved', async () => {
			prisma.user.updateMany.mockResolvedValue({ count: 0 })
			prisma.user.findUnique.mockResolvedValue({ credits: 0 })
			const work = vi.fn()

			await expect(chargeOneCredit('user123', usage, work)).rejects.toThrow(NoCreditsLeftError)
			expect(work).not.toHaveBeenCalled()
			expect(prisma.usage.create).not.toHaveBeenCalled()
		})

		it('should refund the credit and rethrow when the work fails', async () => {
			prisma.user.updateMany.mockResolvedValue({ count: 1 })
			prisma.user.findUnique.mockResolvedValue({ credits: 4 })
			const failure = new Error('generation failed')

			await expect(chargeOneCredit('user123', usage, () => Promise.reject(failure))).rejects.toBe(failure)

			expect(prisma.user.update).toHaveBeenCalledWith({
				data: { credits: { increment: 1 } },
				where: { clerkId: 'user123' },
			})
			expect(prisma.usage.create).not.toHaveBeenCalled()
		})

		it('should still return the result if the usage row cannot be written', async () => {
			prisma.user.updateMany.mockResolvedValue({ count: 1 })
			prisma.user.findUnique.mockResolvedValue({ credits: 4 })
			prisma.usage.create.mockRejectedValue(new Error('db down'))
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

			await expect(chargeOneCredit('user123', usage, async () => 'result')).resolves.toBe('result')
			expect(prisma.user.update).not.toHaveBeenCalled()
			consoleError.mockRestore()
		})

		it('should never spend more credits than the balance under parallel requests', async () => {
			// In-memory stand-in for PostgreSQL: the conditional UPDATE is
			// evaluated and applied as one step, like the real row-level update.
			let balance = 2
			prisma.user.updateMany.mockImplementation(async ({ where }) => {
				await new Promise(resolve => setTimeout(resolve, 1))
				if (balance >= where.credits.gte) {
					balance -= 1
					return { count: 1 }
				}
				return { count: 0 }
			})
			prisma.user.findUnique.mockImplementation(async () => ({
				credits: balance,
			}))

			const results = await Promise.allSettled(
				Array.from({ length: 5 }, () => chargeOneCredit('user123', usage, async () => 'ok'))
			)

			expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(2)
			expect(results.filter(r => r.status === 'rejected' && r.reason instanceof NoCreditsLeftError)).toHaveLength(3)
			expect(balance).toBe(0)
		})
	})

	describe('findActiveApiToken', () => {
		const future = new Date(Date.now() + 60_000)

		it('should return the token when it exists, belongs to the user and is not expired', async () => {
			const token = { expiredAt: future, userId: 'user123', id: 't1' }
			prisma.token.findUnique.mockResolvedValue(token)

			await expect(findActiveApiToken('jwt', 'user123')).resolves.toBe(token)
			expect(prisma.token.findUnique).toHaveBeenCalledWith({
				where: { jwt: 'jwt' },
			})
		})

		it('should return null for a deleted, foreign or expired token', async () => {
			prisma.token.findUnique.mockResolvedValueOnce(null)
			await expect(findActiveApiToken('jwt', 'user123')).resolves.toBeNull()

			prisma.token.findUnique.mockResolvedValueOnce({
				expiredAt: future,
				userId: 'other',
			})
			await expect(findActiveApiToken('jwt', 'user123')).resolves.toBeNull()

			prisma.token.findUnique.mockResolvedValueOnce({
				expiredAt: new Date(Date.now() - 1),
				userId: 'user123',
			})
			await expect(findActiveApiToken('jwt', 'user123')).resolves.toBeNull()
		})

		it('should not query without a jwt or a user id', async () => {
			await expect(findActiveApiToken('', 'user123')).resolves.toBeNull()
			await expect(findActiveApiToken('jwt', undefined)).resolves.toBeNull()
			expect(prisma.token.findUnique).not.toHaveBeenCalled()
		})
	})

	describe('getUsageForUser', () => {
		it('should return usage data for the authenticated user', async () => {
			const mockUser = { id: 'user123', credits: 8 }
			const mockUsageData = [
				{
					usedAt: new Date('2024-06-04T10:53:49.301Z'),
					previousCredits: 10,
					currentCredits: 9,
					used: -1,
				},
				{
					usedAt: new Date('2024-06-04T11:53:49.301Z'),
					previousCredits: 9,
					currentCredits: 8,
					used: -1,
				},
			]
			clerk.auth.mockResolvedValue({ userId: mockUser.id })
			prisma.usage.findMany.mockResolvedValue(mockUsageData)

			const usage = await getUsageForUser()

			expect(usage).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						fullDate: new Date('2024-06-04T10:53:49.301Z'),
						dateHour: '2024-06-04T10',
						creditsLeft: 9,
					}),
					expect.objectContaining({
						fullDate: new Date('2024-06-04T11:53:49.301Z'),
						dateHour: '2024-06-04T11',
						creditsLeft: 8,
					}),
				])
			)
		})

		it('should keep the last operation of an hour when dateHour already exists', async () => {
			const mockUser = { id: 'user123', credits: 8 }
			const mockUsageData = [
				{
					usedAt: new Date('2024-06-04T10:53:49.301Z'),
					previousCredits: 10,
					currentCredits: 9,
					used: -1,
				},
				{
					usedAt: new Date('2024-06-04T10:55:49.301Z'),
					previousCredits: 9,
					currentCredits: 8,
					used: -1,
				},
			]
			clerk.auth.mockResolvedValue({ userId: mockUser.id })
			prisma.usage.findMany.mockResolvedValue(mockUsageData)

			const usage = await getUsageForUser()

			expect(usage).toEqual([
				expect.objectContaining({
					fullDate: new Date('2024-06-04T10:55:49.301Z'),
					dateHour: '2024-06-04T10',
					creditsLeft: 8,
				}),
			])
		})

		it('should return one point per hour, the whole history', async () => {
			const mockUser = { id: 'user123', credits: 0 }
			const mockUsageData = Array.from({ length: 10 }, (_, i) => ({
				usedAt: new Date(`2024-06-04T${10 + i}:53:49.301Z`),
				previousCredits: 10 - i,
				currentCredits: 9 - i,
				used: -1,
			}))
			clerk.auth.mockResolvedValue({ userId: mockUser.id })
			prisma.usage.findMany.mockResolvedValue(mockUsageData)

			const usage = await getUsageForUser()

			expect(usage.map(point => [point.dateHour, point.creditsLeft])).toEqual(
				Array.from({ length: 10 }, (_, i) => [`2024-06-04T${10 + i}`, 9 - i])
			)
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.auth.mockResolvedValue({ userId: null })

			await expect(getUsageForUser()).rejects.toThrow('User not authenticated')
		})

		it('should return an empty array if there is no usage data', async () => {
			const mockUser = { id: 'user123', credits: 10 }
			clerk.auth.mockResolvedValue({ userId: mockUser.id })
			prisma.usage.findMany.mockResolvedValue([])

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
			clerk.auth.mockResolvedValue({ userId: mockUser.id })
			prisma.usage.findMany.mockResolvedValue(mockUsageData)

			const usageByToken = await getUsageByToken()

			expect(usageByToken).toEqual([
				{ token: 'Token1', used: 2 },
				{ token: 'Token2', used: 1 },
			])
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.auth.mockResolvedValue({ userId: null })

			await expect(getUsageByToken()).rejects.toThrow('User not authenticated')
		})
	})

	describe('getSubscriptionFromUserId', () => {
		it('should return the subscription of the authenticated user', async () => {
			const mockUser = { id: 'user123' }
			const mockSubscription = { id: 'sub123', plan: {} }
			clerk.auth.mockResolvedValue({ userId: mockUser.id })
			prisma.subscription.findFirst.mockResolvedValue(mockSubscription)

			const subscription = await getSubscriptionFromUserId()

			expect(subscription).toBe(mockSubscription)
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.auth.mockResolvedValue({ userId: null })

			await expect(getSubscriptionFromUserId()).rejects.toThrow('User not authenticated')
		})
	})

	describe('getCreditsFromUserId', () => {
		it('should return the credits of the authenticated user', async () => {
			const mockUser = { id: 'user123' }
			const mockConnectedUser = { credits: 100 }
			clerk.auth.mockResolvedValue({ userId: mockUser.id })
			prisma.user.findFirst.mockResolvedValue(mockConnectedUser)

			const credits = await getCreditsFromUserId()

			expect(credits).toBe(100)
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.auth.mockResolvedValue({ userId: null })

			await expect(getCreditsFromUserId()).rejects.toThrow('User not authenticated')
		})
	})
})

describe('database input boundaries', () => {
	beforeEach(() => vi.resetAllMocks())

	it.each([NaN, Infinity, -Infinity, 0.1, -0.1, Number.MAX_SAFE_INTEGER + 1, '1', null, undefined, true, [], {}])(
		'rejects unsupported credit values %j before querying storage',
		async credits => {
			await expect(updateCredits('owner', credits, null, 'test')).rejects.toThrow('Invalid credits value')
			expect(prisma.user.findUnique).not.toHaveBeenCalled()
			expect(prisma.user.update).not.toHaveBeenCalled()
		}
	)

	it.each([null, undefined, false, 0, {}, [], ''])(
		'rejects invalid JWT and ownership inputs %j before storage',
		async value => {
			await expect(findActiveApiToken(value, 'owner')).resolves.toBeNull()
			await expect(findActiveApiToken('jwt', value)).resolves.toBeNull()
			expect(prisma.token.findUnique).not.toHaveBeenCalled()
		}
	)

	it.each([new Date(Date.now() - 1), new Date('invalid')])(
		'refuses expired or invalid stored expiry %j',
		async expiredAt => {
			prisma.token.findUnique.mockResolvedValue({ userId: 'owner', expiredAt })
			await expect(findActiveApiToken('jwt', 'owner')).resolves.toBeNull()
		}
	)

	it('treats exactly-current expiry as expired', async () => {
		vi.useFakeTimers()
		try {
			vi.setSystemTime(new Date('2026-10-09T12:00:00Z'))
			prisma.token.findUnique.mockResolvedValue({ userId: 'owner', expiredAt: new Date() })
			await expect(findActiveApiToken('jwt', 'owner')).resolves.toBeNull()
		} finally {
			vi.useRealTimers()
		}
	})
})

describe('account data edge cases', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		clerk.auth.mockResolvedValue({ userId: 'owner' })
	})

	it('recovers the customer id from an existing subscription without losing its original return type', async () => {
		prisma.user.findUnique.mockResolvedValue({ customerId: null })
		prisma.subscription.findFirst.mockResolvedValue({ customerId: '42', userId: 'owner' })
		await expect(getCustomerIdFromUser()).resolves.toBe('42')
		expect(prisma.user.update).toHaveBeenCalledWith({ where: { clerkId: 'owner' }, data: { customerId: 42 } })
	})

	it('returns zero for a missing account row, preserving genuine zero balances', async () => {
		prisma.user.findFirst.mockResolvedValue(null)
		await expect(getCreditsFromUserId()).resolves.toBe(0)
		prisma.user.findFirst.mockResolvedValue({ credits: 0 })
		await expect(getCreditsFromUserId()).resolves.toBe(0)
	})

	it.each([0, -1, 1])('keeps valid signed credit changes %i and optional missing token attribution', async credits => {
		prisma.user.findUnique.mockResolvedValue({ clerkId: 'owner' })
		prisma.user.update.mockResolvedValue({ credits: 7 })
		prisma.token.findFirst.mockResolvedValue(null)
		await updateCredits('owner', credits, 'deleted-jwt', 'adjustment')
		expect(prisma.user.update).toHaveBeenCalledWith(
			expect.objectContaining({ data: { credits: { increment: credits } } })
		)
		expect(prisma.usage.create).toHaveBeenCalledWith({
			data: {
				previousCredits: 7 - credits,
				currentCredits: 7,
				used: credits,
				userId: 'owner',
				tokenId: undefined,
				reason: 'adjustment',
			},
		})
	})

	it('groups UTC history across calendar boundaries and preserves zero balances', async () => {
		prisma.usage.findMany.mockResolvedValue([
			{ usedAt: new Date('2026-12-31T23:59:59Z'), currentCredits: 1 },
			{ usedAt: new Date('2027-01-01T01:00:00+01:00'), currentCredits: 0 },
		])
		expect((await getUsageForUser()).map(point => [point.dateHour, point.creditsLeft])).toEqual([
			['2026-12-31T23', 1],
			['2027-01-01T00', 0],
		])
	})

	it('groups deleted and null-named tokens as playground usage while preserving empty names', async () => {
		prisma.usage.findMany.mockResolvedValue([{ token: null }, { token: { name: null } }, { token: { name: '' } }])
		await expect(getUsageByToken()).resolves.toEqual([
			{ token: 'Playground', used: 2 },
			{ token: '', used: 1 },
		])
		expect(prisma.usage.findMany).toHaveBeenCalledWith({
			where: { userId: 'owner', used: { lt: 0 } },
			include: { token: true },
		})
	})

	it.each([undefined, null, '', false, 0])(
		'preserves an unfiltered plan catalog for falsy filters %j',
		async filter => {
			const plans = [{ billingCycle: 'month' }, { billingCycle: null }]
			prisma.plan.findMany.mockResolvedValue(plans)
			await expect(getPlans(filter)).resolves.toBe(plans)
		}
	)

	it('returns an empty catalog for an unknown billing cycle', async () => {
		prisma.plan.findMany.mockResolvedValue([{ billingCycle: 'month' }])
		await expect(getPlans('unknown')).resolves.toEqual([])
	})
})

describe('provider and reservation error boundaries', () => {
	beforeEach(() => vi.resetAllMocks())

	it('returns a stored customer id without querying or modifying subscriptions', async () => {
		clerk.auth.mockResolvedValue({ userId: 'owner' })
		prisma.user.findUnique.mockResolvedValue({ customerId: 42 })
		await expect(getCustomerIdFromUser()).resolves.toBe(42)
		expect(prisma.subscription.findFirst).not.toHaveBeenCalled()
		expect(prisma.user.update).not.toHaveBeenCalled()
	})

	it.each([
		[null, 195, undefined, 195],
		['sum', undefined, '0x10', 16],
		['sum', undefined, '125', 125],
	])(
		'syncs subscription prices using the existing provider conversion %j',
		async (aggregation, unitPrice, decimalPrice, expectedPrice) => {
			ls.listProducts.mockResolvedValue([
				{ attributes: { name: 'Starter' }, relationships: { variants: { data: [{ id: 'monthly' }] } } },
			])
			ls.getVariant.mockResolvedValue({
				data: { attributes: { name: 'Monthly', product_id: 42, is_subscription: true } },
			})
			ls.listPrice.mockResolvedValue([
				{
					attributes: {
						usage_aggregation: aggregation,
						unit_price: unitPrice,
						unit_price_decimal: decimalPrice,
						renewal_interval_unit: 'month',
						package_size: 250,
					},
				},
			])
			await syncPlans()
			expect(prisma.plan.upsert).toHaveBeenCalledWith({
				where: { variantId: 'monthly' },
				create: expect.objectContaining({
					name: 'Starter',
					price: expectedPrice,
					billingCycle: 'month',
					packageSize: 250,
					productId: '42',
				}),
				update: expect.objectContaining({ price: expectedPrice }),
			})
		}
	)

	it('does not insert a subscription plan without price attributes', async () => {
		const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
		try {
			ls.listProducts.mockResolvedValue([
				{ attributes: { name: 'Starter' }, relationships: { variants: { data: [{ id: 'monthly' }] } } },
			])
			ls.getVariant.mockResolvedValue({
				data: { attributes: { name: 'Monthly', product_id: 42, is_subscription: true } },
			})
			ls.listPrice.mockResolvedValue([])
			await expect(syncPlans()).resolves.toEqual([])
			expect(prisma.plan.upsert).not.toHaveBeenCalled()
			expect(errorLog).toHaveBeenCalledWith('Price object is missing attributes:', undefined)
		} finally {
			errorLog.mockRestore()
		}
	})

	it('preserves the original work error if its refund also fails', async () => {
		const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
		try {
			prisma.$transaction.mockResolvedValue([{ count: 1 }, { credits: 0 }])
			prisma.user.update.mockRejectedValue(new Error('database unavailable'))
			const failure = new Error('provider failed')
			await expect(chargeOneCredit('owner', { reason: 'test' }, () => Promise.reject(failure))).rejects.toBe(failure)
			expect(prisma.usage.create).not.toHaveBeenCalled()
			expect(errorLog).toHaveBeenCalledWith('Failed to refund 1 credit to user owner:', 'database unavailable')
		} finally {
			errorLog.mockRestore()
		}
	})
})
