// POST /api/webhook tells Umami what a Lemon Squeezy event did: `api-purchase`
// when it granted credits, `api-subscription-change` for the other handled
// events. Once per event, never for a duplicate or a failure, and the answer
// to Lemon Squeezy never depends on it.
// The route runs with the real webhook, database and analytics services on an
// in-memory database. `after()` and `fetch` are stubbed: no test reaches Umami.
// @vitest-environment node

import { createHmac } from 'node:crypto'
import { after } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/webhook/route'

import { UMAMI_WEBSITE_ID } from '@/constants/umami'
import { logger } from '@/services/logger.service'

import {
	CLERK_USER_ID,
	GROWTH,
	GROWTH_YEARLY,
	invoicePaid,
	NEVER_SENT,
	orderCreated,
	PACK,
	PLANS,
	STARTER,
	subscriptionEvent,
	subscriptionRow,
	userRow,
} from '/tests/unit/mocks/analyticsPurchaseEvents.fixtures'
import { database } from '/tests/unit/mocks/webhook-idempotency.db'

vi.mock('next/server', () => ({ after: vi.fn() }))
vi.mock('@/services/lemonsqueezy.service')
vi.mock('@/services/prisma.service', async () => {
	const { database } = await vi.importActual('/tests/unit/mocks/webhook-idempotency.db')
	return { prisma: database.client }
})

const SECRET = 'fake-webhook-secret'
const PRODUCTION = { host: 'forvoyez.com' }

const STARTER_MONTHLY = { cycle: 'month', plan: 'starter' }
const GROWTH_MONTHLY = { cycle: 'month', plan: 'growth' }

let fetchMock
let ranTasks

// a signed Lemon Squeezy delivery, as the reverse proxy passes it on
function delivery(payload, headers = PRODUCTION) {
	const body = typeof payload === 'string' ? payload : JSON.stringify(payload)
	return new Request('https://forvoyez.com/api/webhook', {
		headers: { 'X-Signature': createHmac('sha256', SECRET).update(body).digest('hex'), ...headers },
		method: 'POST',
		body,
	})
}

async function deliver(payload, headers) {
	const response = await POST(delivery(payload, headers))
	return response.status
}

// runs what the route scheduled with after() since the last call, then lists
// everything that reached Umami: [event name, properties]
async function sentEvents() {
	const tasks = after.mock.calls.slice(ranTasks)
	ranTasks = after.mock.calls.length
	await Promise.all(tasks.map(([task]) => task()))
	return fetchMock.mock.calls.map(([, init]) => {
		const { name, data } = JSON.parse(init.body).payload
		return [name, data]
	})
}

function credits() {
	return database.credits(CLERK_USER_ID)
}

function givenSubscription(plan, options) {
	database.tables.subscription.push(subscriptionRow(plan, options))
}

beforeEach(() => {
	vi.resetAllMocks()
	ranTasks = 0
	database.reset()
	database.tables.plan.push(...PLANS)
	database.tables.user.push(userRow())
	vi.stubEnv('LEMON_SQUEEZY_WEBHOOK_SECRET', SECRET)
	fetchMock = vi.fn(async () => Response.json({ cache: 'x' }))
	vi.stubGlobal('fetch', fetchMock)
	vi.spyOn(logger, 'info').mockImplementation(() => {})
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
	// whatever the test delivered: nothing about the customer or the sale left
	const sent = JSON.stringify(fetchMock.mock.calls)
	for (const value of NEVER_SENT) expect(sent).not.toContain(value)
	vi.unstubAllEnvs()
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('POST /api/webhook: api-purchase', () => {
	it('reports a paid credit pack, as an Umami event of the webhook path', async () => {
		expect(await deliver(orderCreated(PACK))).toBe(200)

		expect(credits()).toBe(250)
		// the event only leaves in the task given to after()
		expect(after).toHaveBeenCalledTimes(1)
		expect(fetchMock).not.toHaveBeenCalled()

		expect(await sentEvents()).toEqual([
			['api-purchase', { plan: '250-credits', reason: 'first-order', cycle: 'one-time', kind: 'refill', credits: 250 }],
		])
		const [url, init] = fetchMock.mock.calls[0]
		expect(url).toBe('https://umami.wadefade.fr/api/send')
		expect(JSON.parse(init.body)).toEqual({
			payload: {
				data: expect.any(Object),
				website: UMAMI_WEBSITE_ID,
				hostname: 'forvoyez.com',
				name: 'api-purchase',
				url: '/api/webhook',
				language: '',
				referrer: '',
				screen: '',
				title: '',
			},
			type: 'event',
		})
		expect(Object.keys(init.headers).sort()).toEqual(['Content-Type', 'User-Agent'])
	})

	it('reports the first order of a subscription once, although Lemon Squeezy sends three events for it', async () => {
		expect(await deliver(orderCreated(STARTER))).toBe(200)
		expect(await deliver(subscriptionEvent('subscription_created', STARTER))).toBe(200)
		// already credited by order_created: nothing is granted, nothing is reported
		expect(await deliver(invoicePaid('initial'))).toBe(200)

		expect(credits()).toBe(100)
		expect(await sentEvents()).toEqual([
			['api-purchase', { ...STARTER_MONTHLY, reason: 'first-order', kind: 'subscription', credits: 100 }],
			['api-subscription-change', { ...STARTER_MONTHLY, event: 'created' }],
		])
	})

	it.each([
		['a monthly plan', STARTER, { ...STARTER_MONTHLY, credits: 100 }],
		['a yearly plan', GROWTH_YEARLY, { plan: 'growth', cycle: 'year', credits: 6000 }],
	])('reports the renewal of %s with the credits of its plan', async (_case, plan, properties) => {
		givenSubscription(plan)

		expect(await deliver(invoicePaid('renewal'))).toBe(200)

		expect(await sentEvents()).toEqual([['api-purchase', { ...properties, kind: 'subscription', reason: 'renewal' }]])
	})

	it('reports an upgrade as a plan change, then its invoice as a purchase of the extra credits only', async () => {
		givenSubscription(STARTER)

		expect(await deliver(subscriptionEvent('subscription_updated', GROWTH))).toBe(200)
		expect(await deliver(invoicePaid('updated'))).toBe(200)

		expect(credits()).toBe(400)
		expect(await sentEvents()).toEqual([
			['api-subscription-change', { ...GROWTH_MONTHLY, event: 'plan-changed' }],
			['api-purchase', { ...GROWTH_MONTHLY, reason: 'plan-change', kind: 'subscription', credits: 400 }],
		])
	})

	it('reports no purchase for the invoice of a downgrade, which grants nothing', async () => {
		givenSubscription(GROWTH)

		expect(await deliver(subscriptionEvent('subscription_updated', STARTER))).toBe(200)
		expect(await deliver(invoicePaid('updated'))).toBe(200)

		expect(credits()).toBe(0)
		expect(await sentEvents()).toEqual([['api-subscription-change', { ...STARTER_MONTHLY, event: 'plan-changed' }]])
	})

	it('reports nothing for an order that is not paid', async () => {
		expect(await deliver(orderCreated(PACK, { status: 'pending' }))).toBe(200)

		expect(credits()).toBe(0)
		expect(after).not.toHaveBeenCalled()
	})
})

describe('POST /api/webhook: api-subscription-change', () => {
	it.each([
		['subscription_cancelled', 'cancelled', 'cancelled'],
		['subscription_resumed', 'resumed', 'active'],
	])(
		'reports %s with the plan of the subscription, read once the response is sent',
		async (eventName, event, status) => {
			givenSubscription(STARTER)
			// queries made outside the transaction of the event
			const planQueries = vi.spyOn(database.client.plan, 'findUnique')

			expect(await deliver(subscriptionEvent(eventName, STARTER, { status }))).toBe(200)

			expect(database.tables.subscription[0].status).toBe(status)
			expect(planQueries).not.toHaveBeenCalled()

			expect(await sentEvents()).toEqual([['api-subscription-change', { ...STARTER_MONTHLY, event }]])
			expect(planQueries).toHaveBeenCalledTimes(1)
			expect(planQueries).toHaveBeenCalledWith({
				select: { billingCycle: true, name: true },
				where: { variantId: STARTER.variantId },
			})
		}
	)

	it.each([
		['subscription_updated', 'subscription_plan_changed'],
		['subscription_plan_changed', 'subscription_updated'],
	])('reports one plan change when %s and %s both arrive for it', async (first, second) => {
		givenSubscription(STARTER)

		expect(await deliver(subscriptionEvent(first, GROWTH_YEARLY))).toBe(200)
		expect(await deliver(subscriptionEvent(second, GROWTH_YEARLY))).toBe(200)

		expect(await sentEvents()).toEqual([
			['api-subscription-change', { event: 'plan-changed', plan: 'growth', cycle: 'year' }],
		])
	})

	it('reports nothing for a late delivery of an update older than the plan change already applied', async () => {
		givenSubscription(STARTER)
		const newer = { updatedAt: '2026-10-13T10:05:00.000000Z' }
		const older = { updatedAt: '2026-10-13T10:00:00.000000Z' }

		expect(await deliver(subscriptionEvent('subscription_updated', GROWTH, newer))).toBe(200)
		expect(await deliver(subscriptionEvent('subscription_updated', STARTER, older))).toBe(200)

		expect(database.tables.subscription[0].planId).toBe(GROWTH.id)
		expect(await sentEvents()).toEqual([['api-subscription-change', { ...GROWTH_MONTHLY, event: 'plan-changed' }]])
	})

	// Lemon Squeezy sends subscription_updated with every renewal, payment
	// method change or status event: by itself it says nothing new
	it.each([
		['the stored status', 'active', 'active'],
		['the status its own event reports, before that event', 'active', 'cancelled'],
		['the status its own event reports, after a cancellation', 'cancelled', 'active'],
		['a status already stored at creation', 'on_trial', 'on_trial'],
	])('reports nothing for a routine subscription_updated with %s', async (_case, stored, status) => {
		givenSubscription(STARTER, { status: stored })

		expect(await deliver(subscriptionEvent('subscription_updated', STARTER, { status }))).toBe(200)

		expect(after).not.toHaveBeenCalled()
		expect(await sentEvents()).toEqual([])
	})

	// ...except for the statuses that no handled event reports
	it.each([
		['past_due', 'active', 'past-due'],
		['unpaid', 'active', 'unpaid'],
		['paused', 'active', 'paused'],
		['expired', 'cancelled', 'expired'],
		['a_status_added_later', 'active', 'other'],
	])('reports a subscription_updated to the status %s', async (status, stored, reported) => {
		givenSubscription(STARTER, { status: stored })

		expect(await deliver(subscriptionEvent('subscription_updated', STARTER, { status }))).toBe(200)

		// the stored status is still left to the status events
		expect(database.tables.subscription[0].status).toBe(stored)
		expect(await sentEvents()).toEqual([
			['api-subscription-change', { ...STARTER_MONTHLY, status: reported, event: 'updated' }],
		])
	})

	it.each(['subscription_expired', 'subscription_payment_failed', 'order_refunded'])(
		'reports nothing for %s, which the webhook stores but does not handle',
		async eventName => {
			givenSubscription(STARTER)

			expect(await deliver(subscriptionEvent(eventName, STARTER, { status: 'expired' }))).toBe(200)

			expect(database.events().at(-1)).toMatchObject({ processed: true, eventName })
			expect(after).not.toHaveBeenCalled()
		}
	)
})

describe('POST /api/webhook: one event per Lemon Squeezy event', () => {
	it.each([
		['order_created', () => orderCreated(PACK), 250],
		['subscription_payment_success', () => invoicePaid('renewal'), 100],
	])('reports %s once when it is delivered again', async (_event, payload, granted) => {
		givenSubscription(STARTER)

		expect(await deliver(payload())).toBe(200)
		expect(await deliver(payload())).toBe(200)
		expect(await deliver(payload())).toBe(200)

		expect(credits()).toBe(granted)
		expect(database.events().map(row => row.processed)).toEqual([true, true, true])
		expect(after).toHaveBeenCalledTimes(1)
		expect(await sentEvents()).toHaveLength(1)
	})

	it('reports a purchase once when two deliveries of it arrive at the same time', async () => {
		const statuses = await Promise.all([deliver(orderCreated(PACK)), deliver(orderCreated(PACK))])

		expect(statuses).toEqual([200, 200])
		expect(credits()).toBe(250)
		expect(await sentEvents()).toHaveLength(1)
	})

	it('reports each order of the same customer', async () => {
		expect(await deliver(orderCreated(PACK, { id: 9200043 }))).toBe(200)
		expect(await deliver(orderCreated(PACK, { id: 9200044 }))).toBe(200)

		expect(credits()).toBe(500)
		expect(await sentEvents()).toHaveLength(2)
	})

	it('reports a subscription once when its subscription_created is delivered again', async () => {
		expect(await deliver(subscriptionEvent('subscription_created', STARTER))).toBe(200)
		expect(await deliver(subscriptionEvent('subscription_created', STARTER))).toBe(200)

		expect(database.tables.subscription).toHaveLength(1)
		expect(await sentEvents()).toEqual([['api-subscription-change', { ...STARTER_MONTHLY, event: 'created' }]])
	})
})

describe('POST /api/webhook: no event when nothing was processed', () => {
	it('reports nothing for a processing failure, then the purchase once when Lemon Squeezy retries', async () => {
		database.tables.plan.length = 0 // plans not synced yet

		expect(await deliver(orderCreated(PACK))).toBe(500)

		expect(credits()).toBe(0)
		expect(after).not.toHaveBeenCalled()

		database.tables.plan.push(...PLANS) // /api/sync
		expect(await deliver(orderCreated(PACK))).toBe(200)
		expect(await deliver(orderCreated(PACK))).toBe(200)

		expect(credits()).toBe(250)
		expect(await sentEvents()).toHaveLength(1)
	})

	// the last two fail once the credits are added: everything is rolled back
	it.each(['plan.findUnique', 'user.update', 'usage.create', 'webhookEvent.update'])(
		'reports nothing when %s fails while the order is processed',
		async failingCall => {
			database.failOnce(failingCall, new Error('Connection terminated'))

			expect(await deliver(orderCreated(PACK))).toBe(500)

			expect(credits()).toBe(0)
			expect(after).not.toHaveBeenCalled()
		}
	)

	it('reports nothing for an upgrade invoice refused because it arrived before its plan change', async () => {
		givenSubscription(STARTER)

		expect(await deliver(invoicePaid('updated'))).toBe(500)
		expect(after).not.toHaveBeenCalled()

		// then Lemon Squeezy retries it, after the plan change
		expect(await deliver(subscriptionEvent('subscription_updated', GROWTH))).toBe(200)
		expect(await deliver(invoicePaid('updated'))).toBe(200)

		expect((await sentEvents()).map(([name]) => name)).toEqual(['api-subscription-change', 'api-purchase'])
	})

	it('reports nothing when the event cannot be stored', async () => {
		database.failOnce('webhookEvent.create', new Error('Connection refused'))

		expect(await deliver(orderCreated(PACK))).toBe(500)

		expect(after).not.toHaveBeenCalled()
	})

	it.each([
		['unsigned', { 'X-Signature': '' }],
		['signed with another secret', { 'X-Signature': createHmac('sha256', 'other').update('{}').digest('hex') }],
	])('reports nothing for a delivery %s (401)', async (_case, headers) => {
		expect(await deliver(orderCreated(PACK), { ...PRODUCTION, ...headers })).toBe(401)

		expect(database.events()).toHaveLength(0)
		expect(after).not.toHaveBeenCalled()
	})

	it.each([
		['that is not JSON', '{"meta": '],
		['without a user', { ...orderCreated(PACK), meta: { event_name: 'order_created' } }],
		['without data', { meta: orderCreated(PACK).meta }],
	])('reports nothing for a signed payload %s (400)', async (_case, payload) => {
		expect(await deliver(payload)).toBe(400)

		expect(database.events()).toHaveLength(0)
		expect(after).not.toHaveBeenCalled()
	})

	it('reports nothing when the webhook secret is not configured (500)', async () => {
		vi.stubEnv('LEMON_SQUEEZY_WEBHOOK_SECRET', '')

		expect(await deliver(orderCreated(PACK))).toBe(500)

		expect(after).not.toHaveBeenCalled()
	})
})

describe('POST /api/webhook: only production reports', () => {
	it.each([
		['no host header', {}],
		['localhost', { host: 'localhost:3000' }],
		['the docs host', { host: 'doc.forvoyez.com' }],
		['a preview subdomain', { host: 'preview.forvoyez.com' }],
		['a lookalike host', { host: 'forvoyez.com.evil.example' }],
		['a forwarded host that is not production', { 'x-forwarded-host': 'staging.example', host: 'forvoyez.com' }],
	])('processes the event but reports nothing for %s', async (_case, headers) => {
		givenSubscription(STARTER)
		const planQueries = vi.spyOn(database.client.plan, 'findUnique')

		expect(await deliver(orderCreated(PACK), headers)).toBe(200)
		expect(await deliver(subscriptionEvent('subscription_cancelled', STARTER), headers)).toBe(200)

		expect(credits()).toBe(250)
		expect(after).not.toHaveBeenCalled()
		expect(await sentEvents()).toEqual([])
		// and no plan is read for an event that will not leave
		expect(planQueries).not.toHaveBeenCalled()
	})

	it.each([
		['www.forvoyez.com', { host: 'www.forvoyez.com' }],
		['the host forwarded by the proxy', { 'x-forwarded-host': 'forvoyez.com', host: '10.0.1.7:3000' }],
	])('reports for %s', async (_case, headers) => {
		expect(await deliver(orderCreated(PACK), headers)).toBe(200)

		expect(await sentEvents()).toHaveLength(1)
	})
})

describe('POST /api/webhook: the answer never depends on the statistics', () => {
	it('answers 200 and grants the credits when after() is not available', async () => {
		// the real one, called here outside of a Next.js request
		const { after: realAfter } = await vi.importActual('next/server')
		after.mockImplementation(realAfter)
		givenSubscription(STARTER)

		expect(await deliver(orderCreated(PACK))).toBe(200)
		expect(await deliver(subscriptionEvent('subscription_cancelled', STARTER))).toBe(200)

		expect(credits()).toBe(250)
		expect(database.events().map(row => row.processed)).toEqual([true, true])
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it.each([
		['is unreachable', () => Promise.reject(new TypeError('fetch failed'))],
		['answers 500', async () => new Response('down', { status: 500 })],
	])('answers 200 when Umami %s', async (_case, implementation) => {
		fetchMock.mockImplementation(implementation)

		expect(await deliver(orderCreated(PACK))).toBe(200)
		await expect(sentEvents()).resolves.toHaveLength(1)

		expect(credits()).toBe(250)
	})

	it('answers before Umami does', async () => {
		// worst case: the send starts at once and Umami never answers in time
		let umamiAnswers
		fetchMock.mockReturnValue(
			new Promise(resolve => {
				umamiAnswers = resolve
			})
		)
		after.mockImplementation(task => {
			task()
		})

		expect(await deliver(orderCreated(PACK))).toBe(200)

		expect(fetchMock).toHaveBeenCalledTimes(1)
		umamiAnswers(Response.json({}))
	})

	it('answers before the plan of a cancelled subscription is read, and reports it without a plan when that fails', async () => {
		givenSubscription(STARTER)
		// no plan is read while a cancellation is processed: this is the query
		// made for the statistics
		database.failOnce('plan.findUnique', new Error('Connection terminated'))

		expect(await deliver(subscriptionEvent('subscription_cancelled', STARTER, { status: 'cancelled' }))).toBe(200)

		expect(database.tables.subscription[0].status).toBe('cancelled')
		expect(await sentEvents()).toEqual([
			['api-subscription-change', { event: 'cancelled', cycle: 'unknown', plan: 'unknown' }],
		])
	})

	it('does not log anything about a lost event', async () => {
		fetchMock.mockRejectedValue(new TypeError('fetch failed'))
		logger.info.mockClear()

		expect(await deliver(orderCreated(PACK))).toBe(200)
		const logged = logger.info.mock.calls.length
		await sentEvents()

		expect(logger.info).toHaveBeenCalledTimes(logged)
		expect(console.error).not.toHaveBeenCalled()
	})
})
