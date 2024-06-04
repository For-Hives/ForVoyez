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
			prisma.user.create.mockResolvedValue({ id: 'user123' })

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
				id: 'user123',
			})
			prisma.subscription.findFirst
				.mockResolvedValueOnce(null)
				.mockResolvedValue({
					plan: { packageSize: 50 },
					userId: 'user123',
					planId: 'planId',
					oldPlanId: null,
				})

			await processWebhook('webhook123')

			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				50,
				null,
				'Subscription payment success (new plan)'
			)
		})
	})
})
