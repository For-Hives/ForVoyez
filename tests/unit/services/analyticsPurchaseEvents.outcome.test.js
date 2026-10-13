// processWebhook tells its listener what an event did (its outcome), for the
// statistics of the route: once, when the event is committed, never for a
// duplicate or a failure, and with nothing that identifies the customer.
// The real webhook and database services, on an in-memory database.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/services/logger.service'

import { getPlanLabel, processWebhook, saveWebhooks } from '@/services/webhook.service'

import {
	CLERK_USER_ID,
	CUSTOMER_DATA,
	GROWTH,
	GROWTH_YEARLY,
	invoicePaid,
	orderCreated,
	PACK,
	PLANS,
	STARTER,
	subscriptionEvent,
	subscriptionRow,
	userRow,
} from '/tests/unit/mocks/analyticsPurchaseEvents.fixtures'
import { database } from '/tests/unit/mocks/webhook-idempotency.db'

vi.mock('@/services/lemonsqueezy.service')
vi.mock('@/services/prisma.service', async () => {
	const { database } = await vi.importActual('/tests/unit/mocks/webhook-idempotency.db')
	return { prisma: database.client }
})

const STARTER_LABEL = { billingCycle: 'month', name: 'Starter' }
const GROWTH_LABEL = { billingCycle: 'month', name: 'Growth' }

let onProcessed

// stores then processes one delivery, as the route does
async function deliver(payload) {
	const id = await saveWebhooks(payload)
	const processed = await processWebhook(id, onProcessed)
	return { event: database.events().find(row => row.id === id), processed }
}

// what the listener was told, one entry per call
function outcomes() {
	return onProcessed.mock.calls.map(([outcome]) => outcome)
}

function givenSubscription(plan, options) {
	database.tables.subscription.push(subscriptionRow(plan, options))
}

beforeEach(() => {
	database.reset()
	database.tables.plan.push(...PLANS)
	database.tables.user.push(userRow())
	onProcessed = vi.fn()
	vi.spyOn(logger, 'info').mockImplementation(() => {})
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
	// an outcome says which plan, never who or which sale
	const reported = JSON.stringify(onProcessed.mock.calls)
	for (const value of CUSTOMER_DATA) expect(reported).not.toContain(value)
	for (const call of onProcessed.mock.calls) expect(call).toHaveLength(1)
	vi.restoreAllMocks()
})

describe('processWebhook outcome: purchases', () => {
	it('reports a paid credit pack as the first order of a refill', async () => {
		const { processed } = await deliver(orderCreated(PACK))

		expect(processed).toBe(true)
		expect(outcomes()).toEqual([
			{
				plan: { name: '250 credits', billingCycle: null },
				reason: 'first-order',
				type: 'purchase',
				kind: 'refill',
				credits: 250,
			},
		])
	})

	it('reports the first payment of a subscription from its order, not from its initial invoice', async () => {
		await deliver(orderCreated(STARTER))
		await deliver(invoicePaid('initial'))

		expect(outcomes()).toEqual([
			{ reason: 'first-order', kind: 'subscription', plan: STARTER_LABEL, type: 'purchase', credits: 100 },
		])
	})

	it('reports a renewal with the full credits of the plan', async () => {
		givenSubscription(GROWTH_YEARLY)

		await deliver(invoicePaid('renewal'))

		expect(outcomes()).toEqual([
			{
				plan: { billingCycle: 'year', name: 'Growth' },
				kind: 'subscription',
				reason: 'renewal',
				type: 'purchase',
				credits: 6000,
			},
		])
	})

	it('reports the invoice of an upgrade with the extra credits only', async () => {
		givenSubscription(STARTER)

		await deliver(subscriptionEvent('subscription_updated', GROWTH))
		await deliver(invoicePaid('updated'))

		expect(outcomes()[1]).toEqual({
			reason: 'plan-change',
			kind: 'subscription',
			plan: GROWTH_LABEL,
			type: 'purchase',
			credits: 400,
		})
	})

	it.each([
		['an order that is not paid', () => orderCreated(PACK, { status: 'pending' })],
		['the initial invoice of a subscription', () => invoicePaid('initial')],
	])('reports nothing for %s', async (_case, payload) => {
		const { processed, event } = await deliver(payload())

		expect(processed).toBe(true)
		expect(event.processed).toBe(true)
		expect(onProcessed).not.toHaveBeenCalled()
	})

	it('reports nothing for the invoice of a downgrade', async () => {
		givenSubscription(GROWTH)
		await deliver(subscriptionEvent('subscription_updated', STARTER))
		onProcessed.mockClear()

		const { processed } = await deliver(invoicePaid('updated'))

		expect(processed).toBe(true)
		expect(onProcessed).not.toHaveBeenCalled()
	})
})

describe('processWebhook outcome: subscription changes', () => {
	it('reports a created subscription with its plan', async () => {
		await deliver(subscriptionEvent('subscription_created', STARTER))

		expect(outcomes()).toEqual([{ type: 'subscription-change', plan: STARTER_LABEL, change: 'created' }])
	})

	// their handlers only write the status: the plan is named by its variant,
	// for the listener to read later (getPlanLabel)
	it.each([
		['subscription_cancelled', 'cancelled'],
		['subscription_resumed', 'resumed'],
	])('reports %s with the variant of its plan, without reading the plan', async (eventName, change) => {
		givenSubscription(STARTER)
		database.failOnce('plan.findUnique', new Error('no plan is read for this event'))

		const { processed } = await deliver(subscriptionEvent(eventName, STARTER))

		expect(processed).toBe(true)
		expect(outcomes()).toEqual([{ variantId: Number(STARTER.variantId), type: 'subscription-change', change }])
	})

	it.each(['subscription_updated', 'subscription_plan_changed'])(
		'reports a plan change sent as %s',
		async eventName => {
			givenSubscription(STARTER)

			await deliver(subscriptionEvent(eventName, GROWTH))

			expect(outcomes()).toEqual([{ type: 'subscription-change', change: 'plan-changed', plan: GROWTH_LABEL }])
		}
	)

	it('reports a plan change once when the same change arrives again', async () => {
		givenSubscription(STARTER)

		await deliver(subscriptionEvent('subscription_updated', GROWTH))
		await deliver(subscriptionEvent('subscription_plan_changed', GROWTH))
		await deliver(subscriptionEvent('subscription_updated', GROWTH))

		expect(onProcessed).toHaveBeenCalledTimes(1)
	})

	it('reports a routine update only for a status that no handled event reports', async () => {
		givenSubscription(STARTER)

		await deliver(subscriptionEvent('subscription_updated', STARTER, { status: 'active' }))
		await deliver(subscriptionEvent('subscription_updated', STARTER, { status: 'cancelled' }))
		expect(onProcessed).not.toHaveBeenCalled()

		await deliver(subscriptionEvent('subscription_updated', STARTER, { status: 'past_due' }))

		expect(outcomes()).toEqual([
			{ type: 'subscription-change', plan: STARTER_LABEL, status: 'past_due', change: 'updated' },
		])
	})

	it('reports nothing for an event the webhook does not handle', async () => {
		const { processed } = await deliver(subscriptionEvent('subscription_expired', STARTER, { status: 'expired' }))

		expect(processed).toBe(true)
		expect(onProcessed).not.toHaveBeenCalled()
	})
})

describe('processWebhook outcome: when the listener is called', () => {
	it('calls it once the event is committed', async () => {
		let seen
		onProcessed.mockImplementation(() => {
			seen = { processed: database.events().at(-1).processed, credits: database.credits(CLERK_USER_ID) }
		})

		await deliver(orderCreated(PACK))

		expect(seen).toEqual({ processed: true, credits: 250 })
	})

	it.each([
		['order_created', () => orderCreated(PACK)],
		['subscription_payment_success', () => invoicePaid('renewal')],
		['subscription_created', () => subscriptionEvent('subscription_created', GROWTH, { id: 9300099 })],
	])('does not call it again for a second delivery of %s', async (_event, payload) => {
		givenSubscription(STARTER)

		const first = await deliver(payload())
		const second = await deliver(payload())

		expect([first.processed, second.processed]).toEqual([true, true])
		expect(onProcessed).toHaveBeenCalledTimes(1)
	})

	it('calls it once for two deliveries processed at the same time', async () => {
		const ids = [await saveWebhooks(orderCreated(PACK)), await saveWebhooks(orderCreated(PACK))]

		const results = await Promise.all(ids.map(id => processWebhook(id, onProcessed)))

		expect(results).toEqual([true, true])
		expect(onProcessed).toHaveBeenCalledTimes(1)
		expect(database.credits(CLERK_USER_ID)).toBe(250)
	})

	it.each(['plan.findUnique', 'user.update', 'usage.create', 'webhookEvent.update'])(
		'does not call it when %s fails, then once when the event is retried',
		async failingCall => {
			database.failOnce(failingCall, new Error('Connection terminated'))

			const failed = await deliver(orderCreated(PACK))

			expect(failed.processed).toBe(false)
			expect(onProcessed).not.toHaveBeenCalled()

			const retried = await deliver(orderCreated(PACK))

			expect(retried.processed).toBe(true)
			expect(onProcessed).toHaveBeenCalledTimes(1)
		}
	)

	it('does not call it for an event that does not exist', async () => {
		expect(await processWebhook(404, onProcessed)).toBe(false)

		expect(onProcessed).not.toHaveBeenCalled()
	})

	it('keeps the event processed when the listener throws', async () => {
		onProcessed.mockImplementation(() => {
			throw new Error('statistics are down')
		})

		const { processed, event } = await deliver(orderCreated(PACK))

		expect(processed).toBe(true)
		expect(event).toMatchObject({ processingError: null, processed: true })
		expect(database.credits(CLERK_USER_ID)).toBe(250)
		expect(console.error).not.toHaveBeenCalled()
	})

	it('needs no listener', async () => {
		const id = await saveWebhooks(orderCreated(PACK))

		expect(await processWebhook(id)).toBe(true)
		expect(database.credits(CLERK_USER_ID)).toBe(250)
	})
})

describe('getPlanLabel', () => {
	it.each([
		['a string', STARTER.variantId],
		['a number, as Lemon Squeezy sends it', Number(STARTER.variantId)],
	])('reads the name and the billing cycle of the plan of a variant given as %s, nothing else', async (_case, id) => {
		expect(await getPlanLabel(id)).toEqual({ billingCycle: 'month', name: 'Starter' })
	})

	it('reads a credit pack as a plan without a billing cycle', async () => {
		expect(await getPlanLabel(PACK.variantId)).toEqual({ name: '250 credits', billingCycle: null })
	})

	it('answers null for a variant that is not a plan', async () => {
		expect(await getPlanLabel('1')).toBeNull()
	})

	it('only asks the database for these two columns', async () => {
		const query = vi.spyOn(database.client.plan, 'findUnique')

		await getPlanLabel(Number(GROWTH.variantId))

		expect(query).toHaveBeenCalledWith({
			select: { billingCycle: true, name: true },
			where: { variantId: GROWTH.variantId },
		})
	})
})
