import { beforeEach, describe, expect, it, vi } from 'vitest'

import { processWebhook, saveWebhooks } from '@/services/webhook.service'
import { updateCredits } from '@/services/database.service'

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('@/services/database.service')
vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})

describe('Webhook Service', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	describe('saveWebhooks', () => {
		it('should save a webhook event in the database and return its id', async () => {
			const mockWebhook = {
				meta: {
					custom_data: { user_id: 'user123' },
					event_name: 'order_created',
				},
				data: { attributes: { customer_id: 'customer123' } },
			}
			prisma.webhookEvent.create.mockResolvedValue({ id: 'webhook123' })

			const webhookId = await saveWebhooks(mockWebhook)

			expect(webhookId).toBe('webhook123')
			expect(prisma.webhookEvent.create).toHaveBeenCalledWith({
				data: {
					body: JSON.stringify(mockWebhook),
					eventName: 'order_created',
					customerId: 'customer123',
					userId: 'user123',
				},
			})
		})
	})

	describe('processWebhook', () => {
		it('should process the webhook with event name "order_created"', async () => {
			const mockWebhook = {
				body: JSON.stringify({
					data: {
						attributes: {
							first_order_item: { variant_id: 'variant123' },
							customer_id: 'customer_1',
							status: 'paid',
						},
					},
					meta: { custom_data: { user_id: 'user123' } },
				}),
				eventName: 'order_created',
				id: 'webhook123',
			}
			prisma.webhookEvent.findUnique.mockResolvedValue(mockWebhook)
			prisma.plan.findUnique.mockResolvedValue({ packageSize: 100 })
			prisma.user.findUnique.mockResolvedValue(null)
			prisma.user.create.mockResolvedValue({ clerkId: 'user123' })

			await processWebhook('webhook123')

			expect(prisma.user.create).toHaveBeenCalled()
			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				100,
				null,
				'Order created'
			)
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				where: { id: 'webhook123' },
				data: { processed: true },
			})
		})

		it('should update the status of a subscription when "subscription_resumed" event is processed', async () => {
			const mockWebhook = {
				body: JSON.stringify({
					data: {
						attributes: {
							first_subscription_item: { subscription_id: 'sub123' },
							ends_at: '2023-12-31',
						},
					},
				}),
				eventName: 'subscription_resumed',
				id: 'webhook123',
			}
			prisma.webhookEvent.findUnique.mockResolvedValue(mockWebhook)

			await processWebhook('webhook123')

			expect(prisma.subscription.update).toHaveBeenCalledWith({
				data: {
					statusFormatted: 'Active',
					endsAt: '2023-12-31',
					status: 'active',
					isPaused: false,
				},
				where: {
					lemonSqueezyId: 'sub123',
				},
			})
		})

		it('should update the status of a subscription when "subscription_cancelled" event is processed', async () => {
			const mockWebhook = {
				body: JSON.stringify({
					data: {
						attributes: {
							first_subscription_item: { subscription_id: 'sub123' },
							ends_at: '2023-12-31',
						},
					},
				}),
				eventName: 'subscription_cancelled',
				id: 'webhook123',
			}
			prisma.webhookEvent.findUnique.mockResolvedValue(mockWebhook)

			await processWebhook('webhook123')

			expect(prisma.subscription.update).toHaveBeenCalledWith({
				data: {
					statusFormatted: 'Cancelled',
					endsAt: '2023-12-31',
					status: 'cancelled',
				},
				where: {
					lemonSqueezyId: 'sub123',
				},
			})
		})

		it('should update the plan of a subscription when "subscription_plan_changed" event is processed', async () => {
			const mockWebhook = {
				body: JSON.stringify({
					data: {
						attributes: {
							first_subscription_item: { subscription_id: 'sub123' },
							variant_id: 'variant123',
						},
					},
				}),
				eventName: 'subscription_plan_changed',
				id: 'webhook123',
			}
			prisma.webhookEvent.findUnique.mockResolvedValue(mockWebhook)
			prisma.subscription.findFirst.mockResolvedValue({
				plan: { packageSize: 50 },
				lemonSqueezyId: 'sub123',
				planId: 'oldPlanId',
			})
			prisma.plan.findUnique.mockResolvedValue({
				packageSize: 100,
				id: 'newPlanId',
			})

			await processWebhook('webhook123')

			expect(prisma.subscription.update).toHaveBeenCalledWith({
				data: {
					statusFormatted: 'Active',
					oldPlanId: 'oldPlanId',
					planId: 'newPlanId',
					status: 'active',
				},
				where: {
					lemonSqueezyId: 'sub123',
				},
			})
		})

		it('should add credits to the user when "subscription_payment_success" event is processed', async () => {
			const mockWebhook = {
				body: JSON.stringify({
					data: { attributes: { subscription_id: 'sub123' } },
					meta: { custom_data: { user_id: 'user123' } },
				}),
				eventName: 'subscription_payment_success',
				id: 'webhook123',
			}
			prisma.webhookEvent.findUnique.mockResolvedValue(mockWebhook)
			prisma.user.findUnique.mockResolvedValue({
				customerId: 'customer123',
				clerkId: 'user123',
			})
			prisma.subscription.findFirst
				.mockResolvedValueOnce({ // For existingSubscription lookup in the old code path
					plan: { packageSize: 50 },
					userId: 'user123',
					planId: 'planId',
					oldPlanId: null,
				})
				.mockResolvedValueOnce({ // For the sub lookup in the old code path
					plan: { packageSize: 50 },
					userId: 'user123',
					planId: 'planId',
					oldPlanId: null,
				})


			await processWebhook('webhook123')

			// This assertion might need adjustment based on the refactored logic
			// The refactored logic should result in 'Subscription payment success'
			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				50, // This comes from currentSubscription.plan.packageSize
				null,
				'Subscription payment success' // Changed from 'Subscription payment success (new plan)' due to refactor
			)
		})

		describe('processSubscriptionPaymentSuccess specific scenarios', () => {
			let consoleErrorSpy

			beforeEach(() => {
				consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
				prisma.user.findUnique.mockResolvedValue({ clerkId: 'user123', customerId: 'cust123', id: 'dbUser123' })
			})

			afterEach(() => {
				consoleErrorSpy.mockRestore()
			})

			const getMockWebhookEvent = (bodyOverride = {}, eventName = 'subscription_payment_success') => ({
				body: JSON.stringify({
					meta: { custom_data: { user_id: 'user123' } },
					data: { attributes: { subscription_id: 'subLemo123', ...bodyOverride } },
					...bodyOverride, // Allow overriding top-level keys if needed for specific tests
				}),
				eventName,
				id: 'webhookEvent123',
			})
			
			it('Test Case 1a: Plan Change - Old Plan Missing', async () => {
				const webhookEvent = getMockWebhookEvent()
				prisma.subscription.findFirst.mockResolvedValueOnce({ // currentSubscription
					lemonSqueezyId: 'subLemo123',
					userId: 'user123',
					oldPlanId: 'oldPlanDbId1',
					plan: { id: 'newPlanDbId2', packageSize: 100 }, // New plan is valid
				})
				prisma.plan.findUnique.mockResolvedValueOnce(null) // Old plan is missing

				await processWebhook(webhookEvent.id, webhookEvent) // Simulating passing the already parsed webhook for direct call if needed

				expect(updateCredits).toHaveBeenCalledWith('user123', 100, null, 'Subscription payment success (plan change)') // 100 - 0 = 100
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					expect.stringContaining('Old or new plan details missing during plan change credit calculation')
				)
			})

			it('Test Case 1b: Plan Change - New Plan Missing (currentSubscription.plan is null)', async () => {
				const webhookEvent = getMockWebhookEvent()
				prisma.subscription.findFirst.mockResolvedValueOnce({ // currentSubscription
					lemonSqueezyId: 'subLemo123',
					userId: 'user123',
					oldPlanId: 'oldPlanDbId1',
					plan: null, // New plan is missing
				})
				prisma.plan.findUnique.mockResolvedValueOnce({ id: 'oldPlanDbId1', packageSize: 50 }) // Old plan is valid

				await processWebhook(webhookEvent.id, webhookEvent)

				expect(updateCredits).toHaveBeenCalledWith('user123', -50, null, 'Subscription payment success (plan change)') // 0 - 50 = -50
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					expect.stringContaining('Old or new plan details missing during plan change credit calculation')
				)
			})


			it('Test Case 2: Regular Renewal - Plan Missing (currentSubscription.plan is null)', async () => {
				const webhookEvent = getMockWebhookEvent()
				prisma.subscription.findFirst.mockResolvedValueOnce({ // currentSubscription
					lemonSqueezyId: 'subLemo123',
					userId: 'user123',
					oldPlanId: null, // Not a plan change
					plan: null,     // Current plan is missing
				})

				await processWebhook(webhookEvent.id, webhookEvent)

				expect(updateCredits).toHaveBeenCalledWith('user123', 0, null, 'Subscription payment success')
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					expect.stringContaining('Plan details or packageSize missing for regular payment')
				)
			})

			it('Test Case 3: Subscription Not Found', async () => {
				const webhookEvent = getMockWebhookEvent()
				prisma.subscription.findFirst.mockResolvedValueOnce(null) // currentSubscription not found

				await processWebhook(webhookEvent.id, webhookEvent)

				expect(updateCredits).not.toHaveBeenCalled()
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					`Subscription not found for lemonSqueezyId: subLemo123. Cannot process payment.`
				)
			})

			it('Test Case 4: User Mismatch', async () => {
				const webhookEvent = getMockWebhookEvent()
				prisma.subscription.findFirst.mockResolvedValueOnce({ // currentSubscription
					lemonSqueezyId: 'subLemo123',
					userId: 'anotherUserClerkId456', // Different user
					oldPlanId: null,
					plan: { id: 'planDbId1', packageSize: 100 },
				})
				// user.clerkId is 'user123' from prisma.user.findUnique mock

				await processWebhook(webhookEvent.id, webhookEvent)

				expect(updateCredits).not.toHaveBeenCalled()
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					expect.stringContaining('Data inconsistency: Subscription')
				)
			})

			it('Test Case 5: Successful Plan Change', async () => {
				const webhookEvent = getMockWebhookEvent()
				prisma.subscription.findFirst.mockResolvedValueOnce({ // currentSubscription
					lemonSqueezyId: 'subLemo123',
					userId: 'user123',
					oldPlanId: 'oldPlanDbId1',
					plan: { id: 'newPlanDbId2', packageSize: 150 }, // New plan
				})
				prisma.plan.findUnique.mockResolvedValueOnce({ id: 'oldPlanDbId1', packageSize: 50 }) // Old plan

				await processWebhook(webhookEvent.id, webhookEvent)

				expect(updateCredits).toHaveBeenCalledWith('user123', 100, null, 'Subscription payment success (plan change)') // 150 - 50 = 100
				expect(consoleErrorSpy).not.toHaveBeenCalled()
			})

			it('Test Case 6: Successful Regular Renewal', async () => {
				const webhookEvent = getMockWebhookEvent()
				prisma.subscription.findFirst.mockResolvedValueOnce({ // currentSubscription
					lemonSqueezyId: 'subLemo123',
					userId: 'user123',
					oldPlanId: null, // Not a plan change
					plan: { id: 'currentPlanDbId1', packageSize: 75 },
				})

				await processWebhook(webhookEvent.id, webhookEvent)

				expect(updateCredits).toHaveBeenCalledWith('user123', 75, null, 'Subscription payment success')
				expect(consoleErrorSpy).not.toHaveBeenCalled()
			})
		})
	})
})
