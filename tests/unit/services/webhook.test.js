import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { updateCredits } from '@/services/database.service'
import { logger } from '@/services/logger.service'
import { processWebhook, saveWebhooks } from '@/services/webhook.service'

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
	prisma.webhookEvent.findUnique.mockResolvedValueOnce(storedEvent(eventName, payload))
	await processWebhook(1)
}

// WebhookEvent rows answered by prisma.webhookEvent.findMany, filtered like
// the service's queries (eventName, `in`, OR, processingError startsWith,
// processed, userId, id not)
function givenStoredEvents(...events) {
	prisma.webhookEvent.findMany.mockImplementation(async ({ where }) =>
		events
			.map(event => ({ processingError: null, processed: true, ...event }))
			.filter(event => matchesWhere(event, where))
	)
}

function matchesWhere(event, where) {
	return Object.entries(where).every(([field, condition]) => {
		if (field === 'OR') return condition.some(alt => matchesWhere(event, alt))
		const value = event[field]
		if (condition && typeof condition === 'object') {
			if ('in' in condition) return condition.in.includes(value)
			if ('not' in condition) return value !== condition.not
			if ('startsWith' in condition) return String(value ?? '').startsWith(condition.startsWith)
		}
		return value === condition
	})
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

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Keep the existing component or test scenario together during the tooling migration.
describe('Webhook Service', () => {
	let consoleInfo
	let consoleError

	beforeEach(() => {
		vi.resetAllMocks()
		// processWebhook runs each event in an interactive transaction: run it
		// on the same mock (`tx` is `prisma` in these tests)
		prisma.$transaction.mockImplementation(callback => callback(prisma))
		prisma.webhookEvent.findMany.mockResolvedValue([])
		consoleInfo = vi.spyOn(logger, 'info').mockImplementation(() => {})
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

			await expect(deliver('subscription_created', subscriptionCreated('v-unknown'))).resolves.toBeUndefined()

			expect(prisma.subscription.create).not.toHaveBeenCalled()
			expect(prisma.webhookEvent.update).toHaveBeenCalledTimes(1)
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: {
					processingError: expect.stringContaining('Plan not found for variant v-unknown'),
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

			expect(updateCredits).toHaveBeenCalledWith('user123', 50, null, 'Order created', prisma)
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

	// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Keep the existing component or test scenario together during the tooling migration.
	describe('subscription_payment_success', () => {
		const STARTER = { variantId: 'v-starter', packageSize: 100, id: 7 }
		const GROWTH = { variantId: 'v-growth', packageSize: 500, id: 8 }
		const CLEAR_OLD_PLAN = {
			where: { lemonSqueezyId: 'sub-1' },
			data: { oldPlanId: null },
		}

		function planChangedTo(variantId, subscriptionId = 'sub-1') {
			return {
				data: {
					attributes: {
						first_subscription_item: { subscription_id: subscriptionId },
						variant_id: variantId,
					},
					id: subscriptionId,
				},
				meta: { custom_data: { user_id: 'user123' } },
			}
		}

		// the processed subscription_plan_changed events of the user (the
		// duplicate check of the invoice finds no processed invoice)
		function givenProcessedPlanChanges(...payloads) {
			givenStoredEvents(
				...payloads.map((payload, index) => storedEvent('subscription_plan_changed', payload, 50 + index))
			)
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
			expect(updateCredits).toHaveBeenCalledWith('user123', 100, null, 'Subscription payment success', prisma)
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

			await deliver('subscription_payment_success', paymentSuccess('renewal', 'invoice-1'))
			await deliver('subscription_payment_success', paymentSuccess('renewal', 'invoice-2'))

			expect(updateCredits).toHaveBeenCalledTimes(2)
			expect(updateCredits).toHaveBeenNthCalledWith(1, 'user123', 100, null, 'Subscription payment success', prisma)
			expect(updateCredits).toHaveBeenNthCalledWith(2, 'user123', 100, null, 'Subscription payment success', prisma)
			// the plan change marker is used once, then cleared
			expect(prisma.subscription.update).toHaveBeenCalledTimes(1)
			expect(prisma.subscription.update).toHaveBeenCalledWith(CLEAR_OLD_PLAN)
		})

		it('should credit only the extra credits, once, for the invoice of an upgrade', async () => {
			prisma.subscription.findUnique
				.mockResolvedValueOnce(subscriptionRow(GROWTH, STARTER.id))
				.mockResolvedValueOnce(subscriptionRow(GROWTH))
			prisma.plan.findUnique.mockResolvedValue(STARTER)
			givenProcessedPlanChanges(planChangedTo(GROWTH.variantId))

			await deliver('subscription_payment_success', paymentSuccess('updated', 'invoice-1'))
			await deliver('subscription_payment_success', paymentSuccess('renewal', 'invoice-2'))

			expect(prisma.plan.findUnique).toHaveBeenCalledWith({
				where: { id: STARTER.id },
			})
			expect(updateCredits).toHaveBeenCalledTimes(2)
			expect(updateCredits).toHaveBeenNthCalledWith(
				1,
				'user123',
				400,
				null,
				'Subscription payment success (plan change)',
				prisma
			)
			expect(updateCredits).toHaveBeenNthCalledWith(2, 'user123', 500, null, 'Subscription payment success', prisma)
			expect(prisma.subscription.update).toHaveBeenCalledTimes(1)
			expect(prisma.subscription.update).toHaveBeenCalledWith(CLEAR_OLD_PLAN)
		})

		it('should not take credits back for the invoice of a downgrade', async () => {
			prisma.subscription.findUnique.mockResolvedValue(subscriptionRow(STARTER, GROWTH.id))
			prisma.plan.findUnique.mockResolvedValue(GROWTH)
			givenProcessedPlanChanges(planChangedTo(STARTER.variantId))

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
					processingError: expect.stringContaining('Subscription sub-1 not found'),
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
					processingError: expect.stringContaining('plan change not processed yet'),
				},
				where: { id: 1 },
			})

			// resent after subscription_plan_changed: the failed delivery is not
			// a processed duplicate
			givenProcessedPlanChanges(planChangedTo(GROWTH.variantId))
			await deliver('subscription_payment_success', paymentSuccess('updated'))

			expect(updateCredits).toHaveBeenCalledTimes(1)
			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				400,
				null,
				'Subscription payment success (plan change)',
				prisma
			)
		})

		// The previous version set oldPlanId at every plan change and never
		// cleared it (nor marked its events processed): Growth monthly with a
		// stale marker from an old Starter -> Growth change, moving to Growth
		// yearly, with the invoice delivered before the plan change.
		it('should fail an upgrade invoice that comes before its plan change when the marker is a stale one from the previous version', async () => {
			const GROWTH_YEARLY = {
				variantId: 'v-growth-year',
				packageSize: 6000,
				id: 9,
			}
			prisma.subscription.findUnique
				.mockResolvedValueOnce(subscriptionRow(GROWTH, STARTER.id))
				.mockResolvedValueOnce(subscriptionRow(GROWTH_YEARLY, GROWTH.id))
			prisma.plan.findUnique.mockResolvedValue(GROWTH)
			// the old Starter -> Growth change: stored, never marked processed
			givenProcessedPlanChanges()

			await deliver('subscription_payment_success', paymentSuccess('updated'))

			expect(prisma.webhookEvent.findMany).toHaveBeenCalledWith({
				where: {
					OR: [
						{ eventName: 'subscription_plan_changed' },
						{
							processingError: { startsWith: 'Plan change applied' },
							eventName: 'subscription_updated',
						},
					],
					userId: 'user123',
					processed: true,
				},
				select: { eventName: true, body: true },
			})
			// not 500 - 100 credited at once and marked processed
			expect(updateCredits).not.toHaveBeenCalled()
			expect(prisma.subscription.update).not.toHaveBeenCalled()
			expect(prisma.webhookEvent.update).toHaveBeenCalledTimes(1)
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: {
					processingError: expect.stringContaining('plan change not processed yet'),
				},
				where: { id: 1 },
			})

			// resent once this version processed the Growth -> Growth yearly change
			givenProcessedPlanChanges(planChangedTo(GROWTH_YEARLY.variantId))
			await deliver('subscription_payment_success', paymentSuccess('updated'))

			expect(updateCredits).toHaveBeenCalledTimes(1)
			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				5500,
				null,
				'Subscription payment success (plan change)',
				prisma
			)
			expect(prisma.subscription.update).toHaveBeenCalledWith(CLEAR_OLD_PLAN)
		})

		it.each([
			['another subscription', planChangedTo('v-growth', 'sub-2')],
			['another plan', planChangedTo('v-starter')],
			[
				'no subscription item',
				{
					data: {
						attributes: {
							first_subscription_item: null,
							variant_id: 'v-growth',
						},
						id: 'sub-1',
					},
				},
			],
		])('should not take a processed plan change of %s for the plan change of this invoice', async (_case, payload) => {
			prisma.subscription.findUnique.mockResolvedValue(subscriptionRow(GROWTH, STARTER.id))
			prisma.plan.findUnique.mockResolvedValue(STARTER)
			givenProcessedPlanChanges(payload)

			await deliver('subscription_payment_success', paymentSuccess('updated'))

			expect(updateCredits).not.toHaveBeenCalled()
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: {
					processingError: expect.stringContaining('plan change not processed yet'),
				},
				where: { id: 1 },
			})
		})

		it('should credit a renewal in full and clear a stale marker from the previous version', async () => {
			prisma.subscription.findUnique.mockResolvedValue(subscriptionRow(GROWTH, STARTER.id))

			await deliver('subscription_payment_success', paymentSuccess('renewal'))

			expect(updateCredits).toHaveBeenCalledWith('user123', 500, null, 'Subscription payment success', prisma)
			expect(prisma.subscription.update).toHaveBeenCalledWith(CLEAR_OLD_PLAN)
		})

		it.each([
			['the user is unknown', null, 'User user123 not found'],
			['the user has no customer id', { clerkId: 'user123', customerId: null }, 'CustomerId not set for user user123'],
		])('should record an error, not mark the invoice processed, when %s', async (_case, user, message) => {
			prisma.user.findUnique.mockResolvedValue(user)

			await deliver('subscription_payment_success', paymentSuccess('renewal'))

			expect(updateCredits).not.toHaveBeenCalled()
			expect(prisma.webhookEvent.update).toHaveBeenCalledTimes(1)
			expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
				data: { processingError: expect.stringContaining(message) },
				where: { id: 1 },
			})
		})
	})

	// Lemon Squeezy sends no subscription_plan_changed (none in production),
	// only subscription_updated, for every change of a subscription. Runs on
	// an in-memory Subscription row and WebhookEvent table.
	// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Keep the existing component or test scenario together during the tooling migration.
	describe('plan change sent as subscription_updated', () => {
		const STARTER = { variantId: 'v-starter', packageSize: 100, id: 7 }
		const GROWTH = { variantId: 'v-growth', packageSize: 500, id: 8 }
		const PLANS = [STARTER, GROWTH]
		const T1 = '2026-10-08T10:00:00.000000Z'
		const T2 = '2026-10-08T10:05:00.000000Z'

		let subscription // the Subscription row
		let events // the WebhookEvent table
		let nextEventId

		function withPlan() {
			return (
				subscription && {
					...subscription,
					plan: PLANS.find(plan => plan.id === subscription.planId) ?? null,
				}
			)
		}

		function givenSubscriptionOn(plan, oldPlanId = null) {
			subscription = {
				lemonSqueezyId: 'sub-1',
				userId: 'user123',
				planId: plan.id,
				oldPlanId,
			}
		}

		// stores the event (as the route does), then processes it
		async function receive(eventName, payload) {
			const event = {
				...storedEvent(eventName, payload, nextEventId++),
				processingError: null,
				processed: false,
			}
			events.push(event)
			await processWebhook(event.id)
			return event
		}

		// a Lemon Squeezy subscription object (data.id is the subscription)
		function subscriptionPayload(variantId, updatedAt = T1) {
			return {
				data: {
					attributes: {
						first_subscription_item: { subscription_id: 'sub-1' },
						status_formatted: 'Active',
						updated_at: updatedAt,
						variant_id: variantId,
						status: 'active',
						customer_id: 42,
						...CUSTOMER,
					},
					type: 'subscriptions',
					id: 'sub-1',
				},
				meta: { custom_data: { user_id: 'user123' } },
			}
		}

		beforeEach(() => {
			givenSubscriptionOn(STARTER)
			events = []
			nextEventId = 100
			prisma.user.findUnique.mockResolvedValue({
				clerkId: 'user123',
				customerId: 42,
			})
			prisma.plan.findUnique.mockImplementation(
				async ({ where }) =>
					PLANS.find(plan => (where.id === undefined ? plan.variantId === where.variantId : plan.id === where.id)) ??
					null
			)
			prisma.subscription.findUnique.mockImplementation(async () => withPlan())
			prisma.subscription.findFirst.mockImplementation(async () => withPlan())
			prisma.subscription.update.mockImplementation(async ({ data }) => {
				subscription = { ...subscription, ...data }
			})
			prisma.webhookEvent.findUnique.mockImplementation(
				async ({ where }) => events.find(event => event.id === where.id) ?? null
			)
			prisma.webhookEvent.update.mockImplementation(async ({ where, data }) => {
				Object.assign(
					events.find(event => event.id === where.id),
					data
				)
			})
			prisma.webhookEvent.findMany.mockImplementation(async ({ where }) =>
				events.filter(event => matchesWhere(event, where))
			)
		})

		it('applies an upgrade, and its `updated` invoice credits the extra credits once', async () => {
			const update = await receive('subscription_updated', subscriptionPayload(GROWTH.variantId))

			expect(subscription).toMatchObject({ oldPlanId: 7, planId: 8 })
			expect(update).toMatchObject({
				processingError: 'Plan change applied: plan 7 -> plan 8',
				processed: true,
			})
			// the status belongs to the status events
			expect(prisma.subscription.update).toHaveBeenCalledWith({
				where: { lemonSqueezyId: 'sub-1' },
				data: { oldPlanId: 7, planId: 8 },
			})

			await receive('subscription_payment_success', paymentSuccess('updated'))
			await receive('subscription_payment_success', paymentSuccess('renewal', 'invoice-2'))

			expect(updateCredits).toHaveBeenCalledTimes(2)
			expect(updateCredits).toHaveBeenNthCalledWith(
				1,
				'user123',
				400,
				null,
				'Subscription payment success (plan change)',
				prisma
			)
			expect(updateCredits).toHaveBeenNthCalledWith(2, 'user123', 500, null, 'Subscription payment success', prisma)
			expect(subscription.oldPlanId).toBeNull()
		})

		it('applies a downgrade, and its `updated` invoice credits nothing', async () => {
			givenSubscriptionOn(GROWTH)

			await receive('subscription_updated', subscriptionPayload(STARTER.variantId))
			const invoice = await receive('subscription_payment_success', paymentSuccess('updated'))

			expect(subscription).toMatchObject({ oldPlanId: null, planId: 7 })
			expect(updateCredits).not.toHaveBeenCalled()
			expect(invoice).toMatchObject({ processingError: null, processed: true })
		})

		it('changes nothing when the variant is the current plan', async () => {
			const update = await receive('subscription_updated', subscriptionPayload(STARTER.variantId))

			expect(prisma.subscription.update).not.toHaveBeenCalled()
			expect(prisma.plan.findUnique).not.toHaveBeenCalled()
			expect(update).toMatchObject({ processingError: null, processed: true })
		})

		it('records a processing error for an unknown variant', async () => {
			const update = await receive('subscription_updated', subscriptionPayload('v-unknown'))

			expect(prisma.subscription.update).not.toHaveBeenCalled()
			expect(subscription.planId).toBe(7)
			expect(update.processed).toBe(false)
			expect(update.processingError).toContain('Plan not found for variant v-unknown')
		})

		it('records a processing error when the subscription is unknown', async () => {
			subscription = null

			const update = await receive('subscription_updated', subscriptionPayload(GROWTH.variantId))

			expect(update.processed).toBe(false)
			expect(update.processingError).toContain('Subscription sub-1 not found')
		})

		it('credits an upgrade invoice delivered before its subscription_updated once it is resent', async () => {
			const early = await receive('subscription_payment_success', paymentSuccess('updated'))
			expect(early.processed).toBe(false)
			expect(early.processingError).toContain('plan change not processed yet')

			await receive('subscription_updated', subscriptionPayload(GROWTH.variantId))
			await receive('subscription_payment_success', paymentSuccess('updated'))

			expect(updateCredits).toHaveBeenCalledTimes(1)
			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				400,
				null,
				'Subscription payment success (plan change)',
				prisma
			)
		})

		it.each([
			['subscription_updated', 'subscription_plan_changed'],
			['subscription_plan_changed', 'subscription_updated'],
		])('applies the plan change once when %s and %s both arrive', async (first, second) => {
			const payload = subscriptionPayload(GROWTH.variantId)

			await receive(first, payload)
			await receive(second, payload)
			await receive('subscription_payment_success', paymentSuccess('updated'))

			expect(prisma.subscription.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({ oldPlanId: 7, planId: 8 }),
				})
			)
			// the plan change, then clearing the marker after the invoice
			expect(prisma.subscription.update).toHaveBeenCalledTimes(2)
			expect(updateCredits).toHaveBeenCalledTimes(1)
			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				400,
				null,
				'Subscription payment success (plan change)',
				prisma
			)
			expect(events.every(event => event.processed)).toBe(true)
		})

		it('does not move back to the previous plan on a late delivery of an older update', async () => {
			await receive('subscription_updated', subscriptionPayload(GROWTH.variantId, T2))
			const late = await receive('subscription_updated', subscriptionPayload(STARTER.variantId, T1))

			expect(subscription).toMatchObject({ oldPlanId: 7, planId: 8 })
			expect(late).toMatchObject({ processingError: null, processed: true })

			await receive('subscription_payment_success', paymentSuccess('updated'))
			expect(updateCredits).toHaveBeenCalledWith(
				'user123',
				400,
				null,
				'Subscription payment success (plan change)',
				prisma
			)
		})

		// A marker left by the previous version (Starter -> Growth, never
		// cleared), then a routine subscription_updated processed by this
		// version: it does not change the plan, so it is not the plan change of
		// the next `updated` invoice (here Growth -> a bigger plan whose own
		// subscription_updated has not arrived yet).
		it('does not take a routine subscription_updated for the plan change of an invoice', async () => {
			givenSubscriptionOn(GROWTH, STARTER.id)

			await receive('subscription_updated', subscriptionPayload(GROWTH.variantId))
			const invoice = await receive('subscription_payment_success', paymentSuccess('updated'))

			expect(updateCredits).not.toHaveBeenCalled()
			expect(invoice.processed).toBe(false)
			expect(invoice.processingError).toContain('plan change not processed yet')
		})
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
			await deliver('subscription_payment_success', paymentSuccess('initial', 'invoice-1'))

			expect(updateCredits).toHaveBeenCalledTimes(1)
			expect(updateCredits).toHaveBeenCalledWith('user123', 100, null, 'Order created', prisma)

			// the next month
			await deliver('subscription_payment_success', paymentSuccess('renewal', 'invoice-2'))

			expect(updateCredits).toHaveBeenCalledTimes(2)
			expect(updateCredits).toHaveBeenLastCalledWith('user123', 100, null, 'Subscription payment success', prisma)
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
			prisma.webhookEvent.findUnique.mockResolvedValueOnce(storedEvent(eventName, payload, 2))
			await processWebhook(2)
		}

		it('should not credit an order twice when its order_created is delivered again', async () => {
			prisma.webhookEvent.findMany.mockResolvedValue([storedEvent('order_created', orderCreated('v-pack'), 1)])

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
					processingError: expect.stringContaining('Duplicate of webhook event 1'),
					processed: true,
				},
				where: { id: 2 },
			})
		})

		it('should not credit a renewal invoice twice', async () => {
			prisma.webhookEvent.findMany.mockResolvedValue([
				storedEvent('subscription_payment_success', paymentSuccess('renewal', 'invoice-9'), 1),
			])

			await deliverAgain('subscription_payment_success', paymentSuccess('renewal', 'invoice-9'))

			expect(prisma.subscription.findUnique).not.toHaveBeenCalled()
			expect(updateCredits).not.toHaveBeenCalled()
		})

		it('should credit another order of the same user', async () => {
			prisma.webhookEvent.findMany.mockResolvedValue([
				storedEvent('order_created', orderCreated('v-pack', 'paid', 'order-1'), 1),
			])

			await deliverAgain('order_created', orderCreated('v-pack', 'paid', 'order-2'))

			expect(updateCredits).toHaveBeenCalledWith('user123', 50, null, 'Order created', prisma)
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
					processingError: expect.stringContaining('Plan not found for variant variant123'),
				},
				where: { id: 1 },
			})
		})
	})
})
