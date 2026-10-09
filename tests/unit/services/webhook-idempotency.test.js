import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/services/logger.service'

import { processWebhook, saveWebhooks } from '@/services/webhook.service'

import { database } from '/tests/unit/mocks/webhook-idempotency.db'

// The real webhook and database services, on an in-memory database whose
// transactions roll back and whose advisory lock blocks.
vi.mock('@/services/lemonsqueezy.service')
vi.mock('@/services/prisma.service', async () => {
	const { database } = await vi.importActual('/tests/unit/mocks/webhook-idempotency.db')
	return { prisma: database.client }
})

// Lemon Squeezy payloads carry the customer's identity: it must never be logged
const CUSTOMER = { user_email: 'jane.doe@example.com', user_name: 'Jane Doe' }

const PACK = { variantId: 'v-pack', billingCycle: null, packageSize: 50, id: 3 }
const STARTER = { variantId: 'v-starter', packageSize: 100, id: 7 }
const GROWTH = { variantId: 'v-growth', packageSize: 500, id: 8 }
const PRO = { variantId: 'v-pro', packageSize: 2000, id: 9 }

// stores then processes one delivery, as the route does
async function deliver(payload) {
	const id = await saveWebhooks(payload)
	const processed = await processWebhook(id)
	return { event: eventRow(id), processed, id }
}

function eventRow(id) {
	return database.events().find(event => event.id === id)
}

function invoicePaid(billingReason, invoiceId, createdAt) {
	return {
		data: {
			attributes: {
				billing_reason: billingReason,
				subscription_id: 'sub-1',
				created_at: createdAt,
				customer_id: 42,
				...CUSTOMER,
			},
			type: 'subscription-invoices',
			id: invoiceId,
		},
		meta: {
			event_name: 'subscription_payment_success',
			custom_data: { user_id: 'user123' },
		},
	}
}

function orderCreated(orderId = 'order-1', userId = 'user123') {
	return {
		data: {
			attributes: {
				first_order_item: { variant_id: PACK.variantId },
				customer_id: 42,
				status: 'paid',
				...CUSTOMER,
			},
			type: 'orders',
			id: orderId,
		},
		meta: { custom_data: { user_id: userId }, event_name: 'order_created' },
	}
}

function subscription() {
	return database.tables.subscription.find(row => row.lemonSqueezyId === 'sub-1')
}

function subscriptionCreated() {
	return {
		data: {
			attributes: {
				variant_id: STARTER.variantId,
				status_formatted: 'Active',
				status: 'active',
				customer_id: 42,
				order_id: 900,
				...CUSTOMER,
			},
			type: 'subscriptions',
			id: 'sub-2',
		},
		meta: {
			custom_data: { user_id: 'user123' },
			event_name: 'subscription_created',
		},
	}
}

function subscriptionUpdated(variantId, updatedAt) {
	return {
		data: {
			attributes: {
				updated_at: updatedAt,
				variant_id: variantId,
				status: 'active',
				customer_id: 42,
				...CUSTOMER,
			},
			type: 'subscriptions',
			id: 'sub-1',
		},
		meta: {
			custom_data: { user_id: 'user123' },
			event_name: 'subscription_updated',
		},
	}
}

function usageRows() {
	return database.tables.usage
}

const CREDITING_DELIVERIES = [
	['order_created', () => orderCreated('order-1'), PACK.packageSize],
	[
		'subscription_payment_success',
		() => invoicePaid('renewal', 'invoice-1', '2026-10-08T10:00:00.000000Z'),
		STARTER.packageSize,
	],
]

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: Keep the existing component or test scenario together during the tooling migration.
describe('Lemon Squeezy webhook idempotency', () => {
	let consoleInfo
	let consoleError

	beforeEach(() => {
		database.reset()
		database.tables.plan.push(PACK, STARTER, GROWTH, PRO)
		database.tables.user.push({
			clerkId: 'user123',
			customerId: 42,
			credits: 0,
		})
		database.tables.subscription.push({
			lemonSqueezyId: 'sub-1',
			planId: STARTER.id,
			userId: 'user123',
			oldPlanId: null,
		})
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
		vi.restoreAllMocks()
	})

	it.each(CREDITING_DELIVERIES)(
		'credits %s once when the same event is delivered twice',
		async (_event, payload, credits) => {
			const first = await deliver(payload())
			const second = await deliver(payload())

			expect(first.processed).toBe(true)
			expect(second.processed).toBe(true)
			expect(database.credits('user123')).toBe(credits)
			expect(usageRows()).toHaveLength(1)
			expect(first.event).toMatchObject({
				processingError: null,
				processed: true,
			})
			expect(second.event).toMatchObject({
				processingError: `Duplicate of webhook event ${first.id}, already processed: skipped`,
				processed: true,
			})
		}
	)

	it.each(CREDITING_DELIVERIES)(
		'credits %s once when two deliveries are processed at the same time',
		async (event, payload, credits) => {
			const ids = [await saveWebhooks(payload()), await saveWebhooks(payload())]

			const results = await Promise.all(ids.map(id => processWebhook(id)))

			expect(results).toEqual([true, true])
			expect(database.credits('user123')).toBe(credits)
			expect(usageRows()).toHaveLength(1)
			// both took the lock of the event, one after the other
			const key = `lemonsqueezy:${event}:${payload().data.id}`
			expect(database.lockedKeys).toEqual([key, key])
			expect(ids.map(id => eventRow(id).processingError)).toEqual([
				null,
				`Duplicate of webhook event ${ids[0]}, already processed: skipped`,
			])
		}
	)

	it('ignores a processed event whose stored body cannot be read', async () => {
		database.tables.webhookEvent.push({
			eventName: 'order_created',
			processingError: null,
			userId: 'user123',
			body: '{"data":',
			processed: true,
			id: 999,
		})

		const { processed } = await deliver(orderCreated())

		expect(processed).toBe(true)
		expect(database.credits('user123')).toBe(PACK.packageSize)
	})

	it('locks each crediting event on its own key, in a READ COMMITTED transaction', async () => {
		await Promise.all([deliver(orderCreated('order-1')), deliver(orderCreated('order-2'))])
		await deliver(subscriptionUpdated(STARTER.variantId, '2026-10-08T10:00Z'))

		expect(database.credits('user123')).toBe(2 * PACK.packageSize)
		// subscription_updated adds no credits: no lock
		expect(database.lockedKeys).toEqual(['lemonsqueezy:order_created:order-1', 'lemonsqueezy:order_created:order-2'])
		expect(database.transactions).toHaveLength(3)
		expect(database.transactions.every(options => options.isolationLevel === 'ReadCommitted')).toBe(true)
	})

	describe('processing failures', () => {
		// a database error at each step after the duplicate check (the credits
		// are already added when one of the last two fails)
		const FAILURE_POINTS = ['plan.findUnique', 'user.update', 'usage.create', 'webhookEvent.update']

		it.each(FAILURE_POINTS)('rolls back everything and records the error when %s fails', async failingCall => {
			database.failOnce(failingCall, new Error('Connection terminated'))

			const { processed, event } = await deliver(orderCreated())

			expect(processed).toBe(false)
			expect(database.credits('user123')).toBe(0)
			expect(usageRows()).toHaveLength(0)
			expect(event).toMatchObject({
				processingError: 'Connection terminated',
				processed: false,
			})
			expect(consoleError).toHaveBeenCalledWith(`webhook ${event.id} (order_created) processing failed:`, 'Error')
		})

		it.each(FAILURE_POINTS)(
			'credits once when an event that failed at %s is retried, then resent',
			async failingCall => {
				database.failOnce(failingCall, new Error('Connection terminated'))

				const failed = await deliver(orderCreated())
				const retry = await deliver(orderCreated())
				const resend = await deliver(orderCreated())

				expect([failed, retry, resend].map(d => d.processed)).toEqual([false, true, true])
				expect(database.credits('user123')).toBe(PACK.packageSize)
				expect(usageRows()).toHaveLength(1)
				expect(usageRows()[0]).toMatchObject({
					reason: 'Order created',
					previousCredits: 0,
					currentCredits: 50,
					used: 50,
				})
				expect(retry.event).toMatchObject({
					processingError: null,
					processed: true,
				})
				expect(resend.event.processingError).toBe(`Duplicate of webhook event ${retry.id}, already processed: skipped`)
			}
		)

		it('rolls back the credits of a renewal when clearing the plan change marker fails', async () => {
			subscription().oldPlanId = GROWTH.id
			database.failOnce('subscription.update', new Error('deadlock detected'))
			const renewal = () => invoicePaid('renewal', 'invoice-9', '2026-10-08T10:00:00Z')

			const failed = await deliver(renewal())

			expect(failed.processed).toBe(false)
			expect(database.credits('user123')).toBe(0)
			expect(subscription().oldPlanId).toBe(GROWTH.id)

			await deliver(renewal())
			await deliver(renewal())

			expect(database.credits('user123')).toBe(STARTER.packageSize)
			expect(subscription().oldPlanId).toBeNull()
		})

		it('still reports the failure when the error cannot be recorded', async () => {
			database.failOnce('usage.create', new Error('Connection terminated'))
			// the update that records the error fails too: the database is down
			database.failOnce('webhookEvent.update', new Error('Connection lost'))

			const { processed, event } = await deliver(orderCreated())

			expect(processed).toBe(false)
			expect(event).toMatchObject({ processingError: null, processed: false })
			expect(database.credits('user123')).toBe(0)
		})
	})

	describe('events of a user without a User row', () => {
		it('creates the user from the event, so its order is stored and credited', async () => {
			const { processed } = await deliver(orderCreated('order-1', 'user-new'))

			expect(processed).toBe(true)
			expect(database.tables.user).toContainEqual({
				clerkId: 'user-new',
				customerId: 42,
				credits: 50,
			})
		})

		it('does not change an existing user', async () => {
			database.tables.user[0].customerId = 7

			await deliver(orderCreated())

			expect(database.tables.user).toEqual([{ clerkId: 'user123', customerId: 7, credits: 50 }])
		})
	})

	it('skips a redelivered subscription_created instead of failing on its unique id', async () => {
		const first = await deliver(subscriptionCreated())
		const second = await deliver(subscriptionCreated())

		expect([first.processed, second.processed]).toEqual([true, true])
		expect(database.tables.subscription.filter(row => row.lemonSqueezyId === 'sub-2')).toHaveLength(1)
		expect(second.event).toMatchObject({
			processingError: null,
			processed: true,
		})
	})

	// A plan change that sends no `updated` invoice leaves its marker
	// (`oldPlanId`) until the next credited invoice. Days later, the `updated`
	// invoice of another plan change arrives before that change: it must not
	// be credited against the old marker (and then be skipped as a duplicate
	// when retried after its plan change).
	describe('stale plan change marker', () => {
		const DAY_1 = '2026-10-01T10:00:00.000000Z'
		const DAY_5 = '2026-10-05T10:00:00.000000Z'
		const DAY_5_INVOICE = '2026-10-05T10:00:04.000000Z'

		it.each([
			['a downgrade', GROWTH, STARTER],
			['an upgrade billed at the renewal', STARTER, GROWTH],
		])('waits for its own plan change after %s', async (_case, firstPlan, secondPlan) => {
			subscription().planId = firstPlan.id
			await deliver(subscriptionUpdated(secondPlan.variantId, DAY_1))
			expect(subscription()).toMatchObject({
				oldPlanId: firstPlan.id,
				planId: secondPlan.id,
			})

			// day 5: moves to Pro, its invoice comes first
			const invoice = () => invoicePaid('updated', 'invoice-7', DAY_5_INVOICE)
			const early = await deliver(invoice())

			expect(early.processed).toBe(false)
			expect(early.event.processingError).toContain('plan change not processed yet')
			expect(database.credits('user123')).toBe(0)

			await deliver(subscriptionUpdated(PRO.variantId, DAY_5))
			// Lemon Squeezy retries the invoice
			const retried = await deliver(invoice())

			expect(retried.processed).toBe(true)
			expect(database.credits('user123')).toBe(PRO.packageSize - secondPlan.packageSize)
			expect(subscription().oldPlanId).toBeNull()
		})

		it('credits an `updated` invoice created with its plan change, whatever the order', async () => {
			const invoice = () => invoicePaid('updated', 'invoice-7', DAY_5_INVOICE)

			await deliver(invoice()) // before its plan change: fails
			await deliver(subscriptionUpdated(GROWTH.variantId, DAY_5))
			await deliver(invoice())
			await deliver(invoice()) // a late duplicate

			expect(database.credits('user123')).toBe(GROWTH.packageSize - STARTER.packageSize)
		})
	})
})
