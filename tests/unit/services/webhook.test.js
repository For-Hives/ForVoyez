import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

// Lemon Squeezy payloads carry the customer's identity: it must never be logged
const CUSTOMER = { user_email: 'jane.doe@example.com', user_name: 'Jane Doe' }

const SUBSCRIPTION_PLAN = {
	billingCycle: 'month',
	variantId: 'v-sub',
	packageSize: 100,
	id: 7,
}
const CREDIT_PACK_PLAN = {
	variantId: 'v-pack',
	billingCycle: null,
	packageSize: 50,
	id: 3,
}

async function deliver(eventName, payload) {
	prisma.webhookEvent.findUnique.mockResolvedValueOnce(
		storedEvent(eventName, payload)
	)
	await processWebhook(1)
}

function orderCreated(variantId, status = 'paid', orderId = 'order-1') {
	return {
		data: {
			attributes: {
				first_order_item: { variant_id: variantId },
				customer_id: 42,
				...CUSTOMER,
				status,
			},
			id: orderId,
		},
		meta: { custom_data: { user_id: 'user123' } },
	}
}

function paymentSuccess(billingReason, invoiceId = 'invoice-1') {
	return {
		data: {
			attributes: {
				billing_reason: billingReason,
				subscription_id: 'sub-1',
				customer_id: 42,
				...CUSTOMER,
			},
			id: invoiceId,
		},
		meta: { custom_data: { user_id: 'user123' } },
	}
}

function storedEvent(eventName, payload, id = 1) {
	return {
		body: JSON.stringify(payload),
		userId: 'user123',
		eventName,
		id,
	}
}

function subscriptionCreated(variantId = 'v-sub') {
	return {
		data: {
			attributes: {
				status_formatted: 'Active',
				variant_id: variantId,
				trial_ends_at: null,
				status: 'active',
				customer_id: 42,
				renews_at: null,
				ends_at: null,
				order_id: 900,
				...CUSTOMER,
			},
			id: 'sub-1',
		},
		meta: { custom_data: { user_id: 'user123' } },
	}
}

describe('Webhook Service', () => {
	let consoleInfo
	let consoleError

	beforeEach(() => {
		vi.resetAllMocks()
		prisma.webhookEvent.findMany.mockResolvedValue([])
		consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {})
		consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		const logged = [...consoleInfo.mock.calls, ...consoleError.mock.calls]
			.flat()
			.map(argument => String(argument))
			.join('\n')
		expect(logged).not.toContain(CUSTOMER.user_email)
		expect(logged).not.toContain(CUSTOMER.user_name)
		consoleInfo.mockRestore()
		consoleError.mockRestore()
	})

	describe('saveWebhooks', () => {
		it('should save a webhook event in the database and return its id', async () => {
			const mockWebhook = {
				meta: {
					custom_data: { user_id: 'user123' },
					event_name: 'order_created',
				},
				data: { attributes: { customer_id: 123 } },
			}
			prisma.webhookEvent.create.mockResolvedValue({ id: 'webhook123' })

			const webhookId = await saveWebhooks(mockWebhook)

			expect(webhookId).toBe('webhook123')
			expect(prisma.webhookEvent.create).toHaveBeenCalledWith({
				data: {
					body: JSON.stringify(mockWebhook),
					eventName: 'order_created',
					userId: 'user123',
					customerId: 123,
				},
			})
		})
	})

	describe('processWebhook', () => {
		it('should wait for the "processed" flag to be written before resolving', async () => {
			let processedWritten = false
			prisma.webhookEvent.update.mockImplementation(async () => {
				await new Promise(resolve => setTimeout(resolve, 5))
				processedWritten = true
			})

			await deliver('subscription_updated', paymentSuccess('renewal'))

			expect(processedWritten).toBe(true)
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: { processed: true },
				where: { id: 1 },
			})
		})

		it('should record a processing error instead of crashing, and leave processed=false', async () => {
			prisma.user.findUnique.mockResolvedValue({
				clerkId: 'user123',
				customerId: 42,
			})
			prisma.plan.findUnique.mockResolvedValue(null) // plans not synced

			await expect(
				deliver('subscription_created', subscriptionCreated('v-unknown'))
			).resolves.toBeUndefined()

			expect(prisma.subscription.create).not.toHaveBeenCalled()
			expect(prisma.webhookEvent.update).toHaveBeenCalledTimes(1)
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: {
					processingError: expect.stringContaining(
						'Plan not found for variant v-unknown'
					),
				},
				where: { id: 1 },
			})
		})
	})

	describe('order_created', () => {
		it('should create a missing user with existing User columns only', async () => {
			prisma.user.findUnique.mockResolvedValue(null)
			prisma.user.create.mockResolvedValue({ clerkId: 'user123' })
			prisma.plan.findUnique.mockResolvedValue(CREDIT_PACK_PLAN)

			await deliver('order_created', orderCreated('v-pack'))

			expect(prisma.user.create).toHaveBeenCalledWith({
				data: { clerkId: 'user123', customerId: 42 },
			})
		})

		it('should credit a paid one-time credit pack', async () => {
			prisma.user.findUnique.mockResolvedValue({
				clerkId: 'user123',
				customerId: 42,
			})
			prisma.plan.findUnique.mockResolvedValue(CREDIT_PACK_PLAN)

			await deliver('order_created', orderCreated('v-pack'))

			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				50,
				null,
				'Order created'
			)
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: { processed: true },
				where: { id: 1 },
			})
		})

		it('should not credit an unpaid order', async () => {
			prisma.user.findUnique.mockResolvedValue({
				clerkId: 'user123',
				customerId: 42,
			})

			await deliver('order_created', orderCreated('v-pack', 'pending'))

			expect(updateCredits).not.toHaveBeenCalled()
		})
	})

	describe('subscription_created', () => {
		it('should write the Lemon Squeezy customer id as an Int', async () => {
			prisma.user.findUnique.mockResolvedValue({
				clerkId: 'user123',
				customerId: null,
			})
			prisma.plan.findUnique.mockResolvedValue(SUBSCRIPTION_PLAN)
			const payload = subscriptionCreated()
			payload.data.attributes.customer_id = '42' // even if sent as a string

			await deliver('subscription_created', payload)

			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { clerkId: 'user123' },
				data: { customerId: 42 },
			})
			expect(prisma.subscription.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					lemonSqueezyId: 'sub-1',
					userId: 'user123',
					planId: 7,
				}),
			})
		})
	})

	describe('subscription_payment_success', () => {
		const STARTER = { packageSize: 100, id: 7 }
		const GROWTH = { packageSize: 500, id: 8 }
		const CLEAR_OLD_PLAN = {
			where: { lemonSqueezyId: 'sub-1' },
			data: { oldPlanId: null },
		}

		function subscriptionRow(plan, oldPlanId = null) {
			return {
				lemonSqueezyId: 'sub-1',
				userId: 'user123',
				planId: plan.id,
				oldPlanId,
				plan,
			}
		}

		beforeEach(() => {
			prisma.user.findUnique.mockResolvedValue({
				clerkId: 'user123',
				customerId: 42,
			})
		})

		it('should credit a renewal with the plan of the subscription the invoice pays', async () => {
			prisma.subscription.findUnique.mockResolvedValue(subscriptionRow(STARTER))

			await deliver('subscription_payment_success', paymentSuccess('renewal'))

			expect(prisma.subscription.findUnique).toHaveBeenCalledWith({
				where: { lemonSqueezyId: 'sub-1' },
				include: { plan: true },
			})
			expect(updateCredits).toHaveBeenCalledTimes(1)
			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				100,
				null,
				'Subscription payment success'
			)
			expect(prisma.subscription.update).not.toHaveBeenCalled()
		})

		it('should look the subscription up by its Lemon Squeezy id sent as a number', async () => {
			prisma.subscription.findUnique.mockResolvedValue(subscriptionRow(STARTER))
			const payload = paymentSuccess('renewal')
			payload.data.attributes.subscription_id = 1234

			await deliver('subscription_payment_success', payload)

			expect(prisma.subscription.findUnique).toHaveBeenCalledWith({
				where: { lemonSqueezyId: '1234' },
				include: { plan: true },
			})
		})

		it('should credit the full new plan at every renewal after a downgrade, never a negative difference', async () => {
			prisma.subscription.findUnique
				.mockResolvedValueOnce(subscriptionRow(STARTER, GROWTH.id))
				.mockResolvedValueOnce(subscriptionRow(STARTER))
			prisma.plan.findUnique.mockResolvedValue(GROWTH)

			await deliver(
				'subscription_payment_success',
				paymentSuccess('renewal', 'invoice-1')
			)
			await deliver(
				'subscription_payment_success',
				paymentSuccess('renewal', 'invoice-2')
			)

			expect(updateCredits).toHaveBeenCalledTimes(2)
			expect(updateCredits).toHaveBeenNthCalledWith(
				1,
				'user123',
				100,
				null,
				'Subscription payment success'
			)
			expect(updateCredits).toHaveBeenNthCalledWith(
				2,
				'user123',
				100,
				null,
				'Subscription payment success'
			)
			// the plan change marker is used once, then cleared
			expect(prisma.subscription.update).toHaveBeenCalledTimes(1)
			expect(prisma.subscription.update).toHaveBeenCalledWith(CLEAR_OLD_PLAN)
		})

		it('should credit only the extra credits, once, for the invoice of an upgrade', async () => {
			prisma.subscription.findUnique
				.mockResolvedValueOnce(subscriptionRow(GROWTH, STARTER.id))
				.mockResolvedValueOnce(subscriptionRow(GROWTH))
			prisma.plan.findUnique.mockResolvedValue(STARTER)

			await deliver(
				'subscription_payment_success',
				paymentSuccess('updated', 'invoice-1')
			)
			await deliver(
				'subscription_payment_success',
				paymentSuccess('renewal', 'invoice-2')
			)

			expect(prisma.plan.findUnique).toHaveBeenCalledWith({
				where: { id: STARTER.id },
			})
			expect(updateCredits).toHaveBeenCalledTimes(2)
			expect(updateCredits).toHaveBeenNthCalledWith(
				1,
				'user123',
				400,
				null,
				'Subscription payment success (plan change)'
			)
			expect(updateCredits).toHaveBeenNthCalledWith(
				2,
				'user123',
				500,
				null,
				'Subscription payment success'
			)
			expect(prisma.subscription.update).toHaveBeenCalledTimes(1)
			expect(prisma.subscription.update).toHaveBeenCalledWith(CLEAR_OLD_PLAN)
		})

		it('should not take credits back for the invoice of a downgrade', async () => {
			prisma.subscription.findUnique.mockResolvedValue(
				subscriptionRow(STARTER, GROWTH.id)
			)
			prisma.plan.findUnique.mockResolvedValue(GROWTH)

			await deliver('subscription_payment_success', paymentSuccess('updated'))

			expect(updateCredits).not.toHaveBeenCalled()
			expect(prisma.subscription.update).toHaveBeenCalledWith(CLEAR_OLD_PLAN)
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: { processed: true },
				where: { id: 1 },
			})
		})

		it('should record an error and credit nothing when the subscription is unknown', async () => {
			prisma.subscription.findUnique.mockResolvedValue(null)

			await deliver('subscription_payment_success', paymentSuccess('renewal'))

			expect(updateCredits).not.toHaveBeenCalled()
			expect(prisma.webhookEvent.update).toHaveBeenCalledTimes(1)
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: {
					processingError: expect.stringContaining(
						'Subscription sub-1 not found'
					),
				},
				where: { id: 1 },
			})
		})

		it('should not credit the initial payment (already credited by order_created)', async () => {
			await deliver('subscription_payment_success', paymentSuccess('initial'))

			expect(prisma.subscription.findUnique).not.toHaveBeenCalled()
			expect(updateCredits).not.toHaveBeenCalled()
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: { processed: true },
				where: { id: 1 },
			})
		})

		it('should fail an upgrade invoice processed before its plan change, so a resend credits it', async () => {
			// Lemon Squeezy does not order webhooks: the invoice comes first
			prisma.subscription.findUnique
				.mockResolvedValueOnce(subscriptionRow(STARTER))
				.mockResolvedValueOnce(subscriptionRow(GROWTH, STARTER.id))
			prisma.plan.findUnique.mockResolvedValue(STARTER)

			await deliver('subscription_payment_success', paymentSuccess('updated'))

			expect(updateCredits).not.toHaveBeenCalled()
			expect(prisma.webhookEvent.update).toHaveBeenCalledTimes(1)
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: {
					processingError: expect.stringContaining(
						'plan change not processed yet'
					),
				},
				where: { id: 1 },
			})

			// resent after subscription_plan_changed: the failed delivery is not
			// a processed duplicate
			await deliver('subscription_payment_success', paymentSuccess('updated'))

			expect(updateCredits).toHaveBeenCalledTimes(1)
			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				400,
				null,
				'Subscription payment success (plan change)'
			)
		})

		it.each([
			['the user is unknown', null, 'User user123 not found'],
			[
				'the user has no customer id',
				{ clerkId: 'user123', customerId: null },
				'CustomerId not set for user user123',
			],
		])(
			'should record an error, not mark the invoice processed, when %s',
			async (_case, user, message) => {
				prisma.user.findUnique.mockResolvedValue(user)

				await deliver('subscription_payment_success', paymentSuccess('renewal'))

				expect(updateCredits).not.toHaveBeenCalled()
				expect(prisma.webhookEvent.update).toHaveBeenCalledTimes(1)
				expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
					data: { processingError: expect.stringContaining(message) },
					where: { id: 1 },
				})
			}
		)
	})

	describe('first subscription purchase', () => {
		it('should credit the plan exactly once across order_created, subscription_created and subscription_payment_success', async () => {
			prisma.user.findUnique.mockResolvedValue({
				clerkId: 'user123',
				customerId: 42,
			})
			prisma.plan.findUnique.mockResolvedValue(SUBSCRIPTION_PLAN)
			prisma.subscription.findUnique.mockResolvedValue({
				plan: SUBSCRIPTION_PLAN,
				lemonSqueezyId: 'sub-1',
				userId: 'user123',
				oldPlanId: null,
				planId: 7,
			})

			// Lemon Squeezy sends these three events for one checkout
			await deliver('order_created', orderCreated('v-sub'))
			await deliver('subscription_created', subscriptionCreated())
			await deliver(
				'subscription_payment_success',
				paymentSuccess('initial', 'invoice-1')
			)

			expect(updateCredits).toHaveBeenCalledTimes(1)
			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				100,
				null,
				'Order created'
			)

			// the next month
			await deliver(
				'subscription_payment_success',
				paymentSuccess('renewal', 'invoice-2')
			)

			expect(updateCredits).toHaveBeenCalledTimes(2)
			expect(updateCredits).toHaveBeenLastCalledWith(
				'user123',
				100,
				null,
				'Subscription payment success'
			)
		})
	})

	describe('redelivered events', () => {
		beforeEach(() => {
			prisma.user.findUnique.mockResolvedValue({
				clerkId: 'user123',
				customerId: 42,
			})
			prisma.plan.findUnique.mockResolvedValue(CREDIT_PACK_PLAN)
		})

		async function deliverAgain(eventName, payload) {
			prisma.webhookEvent.findUnique.mockResolvedValueOnce(
				storedEvent(eventName, payload, 2)
			)
			await processWebhook(2)
		}

		it('should not credit an order twice when its order_created is delivered again', async () => {
			prisma.webhookEvent.findMany.mockResolvedValue([
				storedEvent('order_created', orderCreated('v-pack'), 1),
			])

			await deliverAgain('order_created', orderCreated('v-pack'))

			expect(prisma.webhookEvent.findMany).toHaveBeenCalledWith({
				where: {
					eventName: 'order_created',
					userId: 'user123',
					processed: true,
					id: { not: 2 },
				},
				select: { body: true, id: true },
				orderBy: { id: 'asc' },
			})
			expect(updateCredits).not.toHaveBeenCalled()
			expect(prisma.webhookEvent.update).toHaveBeenCalledTimes(1)
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: {
					processingError: expect.stringContaining(
						'Duplicate of webhook event 1'
					),
					processed: true,
				},
				where: { id: 2 },
			})
		})

		it('should not credit a renewal invoice twice', async () => {
			prisma.webhookEvent.findMany.mockResolvedValue([
				storedEvent(
					'subscription_payment_success',
					paymentSuccess('renewal', 'invoice-9'),
					1
				),
			])

			await deliverAgain(
				'subscription_payment_success',
				paymentSuccess('renewal', 'invoice-9')
			)

			expect(prisma.subscription.findUnique).not.toHaveBeenCalled()
			expect(updateCredits).not.toHaveBeenCalled()
		})

		it('should credit another order of the same user', async () => {
			prisma.webhookEvent.findMany.mockResolvedValue([
				storedEvent(
					'order_created',
					orderCreated('v-pack', 'paid', 'order-1'),
					1
				),
			])

			await deliverAgain(
				'order_created',
				orderCreated('v-pack', 'paid', 'order-2')
			)

			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				50,
				null,
				'Order created'
			)
		})

		it('should only look for duplicates of events that add credits', async () => {
			await deliverAgain('subscription_cancelled', {
				data: {
					attributes: {
						first_subscription_item: { subscription_id: 'sub123' },
						ends_at: '2023-12-31',
					},
					id: 'sub123',
				},
			})

			expect(prisma.webhookEvent.findMany).not.toHaveBeenCalled()
			expect(prisma.subscription.update).toHaveBeenCalled()
		})
	})

	describe('subscription status events', () => {
		it('should update the status of a subscription when "subscription_resumed" event is processed', async () => {
			await deliver('subscription_resumed', {
				data: {
					attributes: {
						first_subscription_item: { subscription_id: 'sub123' },
						ends_at: '2023-12-31',
					},
				},
			})

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
			await deliver('subscription_cancelled', {
				data: {
					attributes: {
						first_subscription_item: { subscription_id: 'sub123' },
						ends_at: '2023-12-31',
					},
				},
			})

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
			prisma.subscription.findFirst.mockResolvedValue({
				plan: { packageSize: 50 },
				lemonSqueezyId: 'sub123',
				planId: 'oldPlanId',
			})
			prisma.plan.findUnique.mockResolvedValue({
				packageSize: 100,
				id: 'newPlanId',
			})

			await deliver('subscription_plan_changed', {
				data: {
					attributes: {
						first_subscription_item: { subscription_id: 'sub123' },
						variant_id: 'variant123',
					},
				},
			})

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

		const planChanged = {
			data: {
				attributes: {
					first_subscription_item: { subscription_id: 'sub123' },
					variant_id: 'variant123',
				},
			},
		}

		it('should keep the old plan when "subscription_plan_changed" is delivered again', async () => {
			// already moved from plan 7 to plan 8 by the first delivery
			prisma.subscription.findFirst.mockResolvedValue({
				lemonSqueezyId: 'sub123',
				oldPlanId: 7,
				planId: 8,
			})
			prisma.plan.findUnique.mockResolvedValue({ packageSize: 500, id: 8 })

			await deliver('subscription_plan_changed', planChanged)

			expect(prisma.subscription.update).not.toHaveBeenCalled()
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: { processed: true },
				where: { id: 1 },
			})
		})

		it('should record an error when the new plan is not synced', async () => {
			prisma.subscription.findFirst.mockResolvedValue({
				lemonSqueezyId: 'sub123',
				planId: 7,
			})
			prisma.plan.findUnique.mockResolvedValue(null)

			await deliver('subscription_plan_changed', planChanged)

			expect(prisma.subscription.update).not.toHaveBeenCalled()
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: {
					processingError: expect.stringContaining(
						'Plan not found for variant variant123'
					),
				},
				where: { id: 1 },
			})
		})
	})
})
