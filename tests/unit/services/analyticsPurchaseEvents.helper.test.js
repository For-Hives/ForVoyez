// trackWebhookOutcome (serverAnalytics.service) turns what a Lemon Squeezy
// event did into one Umami event: which values can leave, when a plan is read,
// and that nothing here can throw or wait. `after()` and `fetch` are stubbed:
// no test ever reaches Umami.
// @vitest-environment node

import { after } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { slug } from '@/helpers/analytics'
import { trackServerEvent, trackWebhookOutcome } from '@/services/serverAnalytics.service'

vi.mock('next/server', () => ({ after: vi.fn() }))

const PRODUCTION = { host: 'forvoyez.com' }
const STARTER = { billingCycle: 'month', name: 'Starter' }
const UNKNOWN_PLAN = { cycle: 'unknown', plan: 'unknown' }

function request(headers = PRODUCTION) {
	return new Request('https://forvoyez.com/api/webhook', { headers, method: 'POST' })
}

function purchase(fields = {}) {
	return { reason: 'renewal', kind: 'subscription', type: 'purchase', plan: STARTER, credits: 100, ...fields }
}

function change(fields = {}) {
	return { type: 'subscription-change', change: 'created', plan: STARTER, ...fields }
}

// what Next.js does once the response is sent
function runScheduled() {
	return Promise.all(after.mock.calls.map(([task]) => task()))
}

let fetchMock
let consoleSpies

// [event name, properties] of everything that reached Umami
function sentEvents() {
	return fetchMock.mock.calls.map(([, init]) => {
		const { name, data } = JSON.parse(init.body).payload
		return [name, data]
	})
}

async function sentData(outcome, readPlan) {
	trackWebhookOutcome(request(), outcome, readPlan)
	await runScheduled()
	return sentEvents().at(-1)?.[1]
}

beforeEach(() => {
	vi.resetAllMocks()
	fetchMock = vi.fn(async () => Response.json({ cache: 'x' }))
	vi.stubGlobal('fetch', fetchMock)
	consoleSpies = ['error', 'warn', 'info', 'log'].map(level => vi.spyOn(console, level).mockImplementation(() => {}))
})

afterEach(() => {
	// like the other server events: never a log line
	for (const spy of consoleSpies) expect(spy).not.toHaveBeenCalled()
	vi.useRealTimers()
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('trackWebhookOutcome: the event of each outcome', () => {
	it.each([
		[
			'the first order of a credit pack',
			purchase({
				plan: { name: '250 credits', billingCycle: null },
				reason: 'first-order',
				kind: 'refill',
				credits: 250,
			}),
			'api-purchase',
			{ plan: '250-credits', reason: 'first-order', cycle: 'one-time', kind: 'refill', credits: 250 },
		],
		[
			'the first order of a subscription',
			purchase({ reason: 'first-order' }),
			'api-purchase',
			{ reason: 'first-order', kind: 'subscription', plan: 'starter', cycle: 'month', credits: 100 },
		],
		[
			'a renewal',
			purchase({ plan: { billingCycle: 'year', name: 'Growth' }, credits: 6000 }),
			'api-purchase',
			{ kind: 'subscription', reason: 'renewal', plan: 'growth', cycle: 'year', credits: 6000 },
		],
		[
			'the invoice of an upgrade',
			purchase({ reason: 'plan-change', credits: 400 }),
			'api-purchase',
			{ reason: 'plan-change', kind: 'subscription', plan: 'starter', cycle: 'month', credits: 400 },
		],
		[
			'a created subscription',
			change(),
			'api-subscription-change',
			{ event: 'created', plan: 'starter', cycle: 'month' },
		],
		[
			'a cancelled subscription',
			change({ change: 'cancelled' }),
			'api-subscription-change',
			{ event: 'cancelled', plan: 'starter', cycle: 'month' },
		],
		[
			'a resumed subscription',
			change({ change: 'resumed' }),
			'api-subscription-change',
			{ event: 'resumed', plan: 'starter', cycle: 'month' },
		],
		[
			'a plan change',
			change({ change: 'plan-changed' }),
			'api-subscription-change',
			{ event: 'plan-changed', plan: 'starter', cycle: 'month' },
		],
		[
			'an update to a status without an event of its own',
			change({ change: 'updated', status: 'past_due' }),
			'api-subscription-change',
			{ status: 'past-due', event: 'updated', plan: 'starter', cycle: 'month' },
		],
	])('reports %s', async (_case, outcome, name, data) => {
		trackWebhookOutcome(request(), outcome)

		// built at once, sent by the task given to after()
		expect(after).toHaveBeenCalledTimes(1)
		expect(fetchMock).not.toHaveBeenCalled()
		await runScheduled()

		expect(sentEvents()).toEqual([[name, data]])
		expect(name.length).toBeLessThanOrEqual(50)
		expect(JSON.parse(fetchMock.mock.calls[0][1].body).payload.url).toBe('/api/webhook')
	})

	it.each([
		[undefined],
		[null],
		[{}],
		[{ type: 'refund' }],
		[{ type: '__proto__' }],
		[{ type: 'api-purchase' }],
		['purchase'],
	])('reports nothing for %j, which is not an outcome', outcome => {
		expect(() => trackWebhookOutcome(request(), outcome)).not.toThrow()

		expect(after).not.toHaveBeenCalled()
	})

	it.each([
		['no host header', {}],
		['localhost', { host: 'localhost:3000' }],
		['a preview subdomain', { host: 'preview.forvoyez.com' }],
		['a forwarded host that is not production', { 'x-forwarded-host': 'staging.example', host: 'forvoyez.com' }],
	])('reports nothing for %s, and reads no plan for it', async (_case, headers) => {
		const readPlan = vi.fn(async () => STARTER)

		trackWebhookOutcome(request(headers), purchase())
		trackWebhookOutcome(request(headers), change({ variantId: 601, plan: undefined }), readPlan)

		expect(after).not.toHaveBeenCalled()
		await runScheduled()
		expect(readPlan).not.toHaveBeenCalled()
		expect(fetchMock).not.toHaveBeenCalled()
	})
})

describe('trackWebhookOutcome: what can leave', () => {
	it.each([
		['Starter', 'starter'],
		['250 credits', '250-credits'],
		['  Growth — Agency (2026)!  ', 'growth-agency-2026'],
		[
			'Plan Entreprise Très Grand Compte Illimité Annuel Avec Support Prioritaire',
			'plan-entreprise-tr-s-grand-compte-illimit-annuel-avec-suppor',
		],
		['', 'unknown'],
		['—', 'unknown'],
		[undefined, 'unknown'],
		[null, 'unknown'],
	])('reports the plan named %j as %s, like the browser events do', async (name, plan) => {
		expect(await sentData(purchase({ plan: { billingCycle: 'month', name } }))).toMatchObject({ cycle: 'month', plan })
		// the `plan` of pricing-plan-click and plans-checkout-click
		expect(slug(name) || 'unknown').toBe(plan)
	})

	it.each([
		['month', 'month'],
		['year', 'year'],
		[null, 'one-time'],
		[undefined, 'one-time'],
		['week', 'other'],
		['day', 'other'],
		['', 'other'],
		['jane@example.com', 'other'],
	])('reports the billing cycle %j as %s', async (billingCycle, cycle) => {
		expect(await sentData(change({ plan: { name: 'Starter', billingCycle } }))).toEqual({
			event: 'created',
			plan: 'starter',
			cycle,
		})
	})

	it.each([[undefined], [null], [false], ['Starter'], [0]])(
		'reports an unknown plan and cycle when the outcome has %j for a plan',
		async plan => {
			expect(await sentData(purchase({ plan }))).toMatchObject(UNKNOWN_PLAN)
			expect(await sentData(change({ plan }))).toEqual({ ...UNKNOWN_PLAN, event: 'created' })
		}
	)

	it.each([
		['on_trial', 'on-trial'],
		['active', 'active'],
		['paused', 'paused'],
		['past_due', 'past-due'],
		['unpaid', 'unpaid'],
		['cancelled', 'cancelled'],
		['expired', 'expired'],
		['Past Due', 'past-due'],
		['something_new', 'other'],
		['jane.doe@example.com', 'other'],
		['', 'other'],
		[undefined, 'other'],
		[42, 'other'],
	])('reports the status %j of an update as %s', async (status, reported) => {
		expect(await sentData(change({ change: 'updated', status }))).toMatchObject({ status: reported, event: 'updated' })
	})

	it.each(['created', 'cancelled', 'resumed', 'plan-changed'])(
		'says no status for a subscription %s, only for an update',
		async changed => {
			const data = await sentData(change({ change: changed, status: 'active' }))

			expect(data).toEqual({ event: changed, plan: 'starter', cycle: 'month' })
		}
	)

	it.each([
		['kind', 'kind', purchase({ kind: 'jane.doe@example.com' })],
		['reason', 'reason', purchase({ reason: 'refund of order 9200043' })],
		['reason', 'reason', purchase({ reason: undefined })],
		['change', 'event', change({ change: 'deleted by user_2zQfClerkJane' })],
		['change', 'event', change({ change: { toString: () => 'created' } })],
	])("reports 'other' for a %s it does not know", async (_field, property, outcome) => {
		expect((await sentData(outcome))[property]).toBe('other')
	})

	it.each([[Number.NaN], [Number.POSITIVE_INFINITY], [undefined], [null], ['250'], [{ valueOf: () => 250 }]])(
		'reports 0 credits when the outcome has %j for them',
		async credits => {
			expect((await sentData(purchase({ credits }))).credits).toBe(0)
		}
	)

	it('sends its own properties only, whatever else the outcome holds', async () => {
		const leaky = {
			subscription: { lemonSqueezyId: '9300044', email: 'jane.doe@example.com' },
			plan: { ...STARTER, description: 'Monthly plan', price: 91919, id: 7 },
			userName: 'Jane Doe',
			userId: 'user_2zQfClerkJane',
			customerId: 9100042,
			orderId: 9200043,
			variantId: 9500047,
			total: 91919,
		}

		trackWebhookOutcome(request(), purchase(leaky))
		trackWebhookOutcome(request(), change({ ...leaky, change: 'updated', status: 'unpaid' }))
		await runScheduled()

		expect(sentEvents()).toEqual([
			['api-purchase', { kind: 'subscription', reason: 'renewal', plan: 'starter', cycle: 'month', credits: 100 }],
			['api-subscription-change', { event: 'updated', status: 'unpaid', plan: 'starter', cycle: 'month' }],
		])
		const sent = JSON.stringify(fetchMock.mock.calls)
		for (const value of ['jane', 'Jane', 'user_2zQ', '9100042', '9200043', '9300044', '9500047', '91919', 'Monthly']) {
			expect(sent).not.toContain(value)
		}
		// only the fixed headers leave, nothing of the webhook delivery
		for (const [, init] of fetchMock.mock.calls) {
			expect(Object.keys(init.headers).sort()).toEqual(['Content-Type', 'User-Agent'])
		}
	})
})

describe('trackWebhookOutcome: a plan named by its variant', () => {
	const CANCELLED = { type: 'subscription-change', change: 'cancelled', variantId: 9500047 }

	it('reads the plan once the response is sent, not before', async () => {
		const readPlan = vi.fn(async () => STARTER)

		trackWebhookOutcome(request(), CANCELLED, readPlan)

		expect(after).toHaveBeenCalledTimes(1)
		expect(readPlan).not.toHaveBeenCalled()

		await runScheduled()

		expect(readPlan).toHaveBeenCalledTimes(1)
		expect(readPlan).toHaveBeenCalledWith(9500047)
		expect(sentEvents()).toEqual([['api-subscription-change', { event: 'cancelled', plan: 'starter', cycle: 'month' }]])
		expect(JSON.stringify(fetchMock.mock.calls)).not.toContain('9500047')
	})

	it('does not read a plan the outcome already has', async () => {
		const readPlan = vi.fn(async () => ({ billingCycle: 'year', name: 'Growth' }))

		expect(await sentData(change({ variantId: 9500047 }), readPlan)).toEqual({
			event: 'created',
			plan: 'starter',
			cycle: 'month',
		})
		expect(readPlan).not.toHaveBeenCalled()
	})

	it.each([
		['finds no plan', async () => null],
		['rejects', () => Promise.reject(new Error('Connection terminated'))],
		[
			'throws at once',
			() => {
				throw new Error('boom')
			},
		],
		['answers something that is not a plan', async () => 'Starter'],
	])('reports the event with an unknown plan when the reader %s', async (_case, readPlan) => {
		expect(await sentData(CANCELLED, readPlan)).toEqual({ ...UNKNOWN_PLAN, event: 'cancelled' })
	})

	it.each([[undefined], [null], ['getPlanLabel'], [{}]])(
		'reports the event with an unknown plan at once when the reader is %j',
		async readPlan => {
			expect(await sentData(CANCELLED, readPlan)).toEqual({ ...UNKNOWN_PLAN, event: 'cancelled' })
		}
	)

	it('gives the reader 2 s, then reports the event with an unknown plan', async () => {
		vi.useFakeTimers()
		const readPlan = vi.fn(() => new Promise(() => {}))

		trackWebhookOutcome(request(), CANCELLED, readPlan)
		const sending = runScheduled()
		await vi.advanceTimersByTimeAsync(1999)
		expect(fetchMock).not.toHaveBeenCalled()

		await vi.advanceTimersByTimeAsync(1)
		await sending

		expect(sentEvents()).toEqual([['api-subscription-change', { ...UNKNOWN_PLAN, event: 'cancelled' }]])
	})

	it('does not keep a timer once the plan is read', async () => {
		vi.useFakeTimers()

		trackWebhookOutcome(request(), CANCELLED, async () => STARTER)
		await runScheduled()

		expect(vi.getTimerCount()).toBe(0)
		expect(sentEvents()).toHaveLength(1)
	})

	it('ignores a reader that fails after its 2 s', async () => {
		vi.useFakeTimers()
		let fail
		const readPlan = () =>
			new Promise((_resolve, reject) => {
				fail = reject
			})

		trackWebhookOutcome(request(), CANCELLED, readPlan)
		const sending = runScheduled()
		await vi.advanceTimersByTimeAsync(2000)
		await sending
		fail(new Error('Connection terminated'))
		await vi.advanceTimersByTimeAsync(0)

		expect(sentEvents()).toHaveLength(1)
	})
})

describe('trackWebhookOutcome: never break or slow the webhook', () => {
	const CANCELLED = { type: 'subscription-change', change: 'cancelled', variantId: 9500047 }
	const OUTSIDE_REQUEST_ERROR = '`after` was called outside a request scope'

	it('does nothing when after() is not available', async () => {
		// the real one, called here outside of a Next.js request
		const { after: realAfter } = await vi.importActual('next/server')
		expect(() => realAfter(() => {})).toThrow(OUTSIDE_REQUEST_ERROR)
		after.mockImplementation(realAfter)
		const readPlan = vi.fn(async () => STARTER)

		expect(() => trackWebhookOutcome(request(), purchase())).not.toThrow()
		expect(() => trackWebhookOutcome(request(), CANCELLED, readPlan)).not.toThrow()

		expect(readPlan).not.toHaveBeenCalled()
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it.each([
		['no request', undefined],
		['a request without headers', {}],
		[
			'headers that cannot be read',
			{
				headers: {
					get: () => {
						throw new Error('boom')
					},
				},
			},
		],
	])('does not throw with %s', (_case, brokenRequest) => {
		expect(() => trackWebhookOutcome(brokenRequest, purchase())).not.toThrow()
		expect(() => trackWebhookOutcome(brokenRequest, CANCELLED, async () => STARTER)).not.toThrow()
		expect(after).not.toHaveBeenCalled()
	})

	it('does not throw with an outcome that cannot be read', () => {
		const hostile = new Proxy(
			{},
			{
				get: () => {
					throw new Error('boom')
				},
			}
		)

		expect(() => trackWebhookOutcome(request(), hostile)).not.toThrow()
		expect(() => trackWebhookOutcome(request(), purchase({ plan: hostile }))).not.toThrow()
		expect(after).not.toHaveBeenCalled()
	})

	it.each([
		['is unreachable', () => Promise.reject(new TypeError('fetch failed'))],
		[
			'throws at once',
			() => {
				throw new Error('boom')
			},
		],
		['answers 500', async () => new Response('down', { status: 500 })],
	])('swallows the error when Umami %s', async (_case, implementation) => {
		fetchMock.mockImplementation(implementation)

		trackWebhookOutcome(request(), purchase())
		trackWebhookOutcome(request(), CANCELLED, async () => STARTER)
		await expect(runScheduled()).resolves.toBeDefined()

		expect(fetchMock).toHaveBeenCalledTimes(2)
	})

	it('returns before Umami or the plan reader answers', () => {
		// the 2 s given to the reader never elapse: nothing is sent after the test
		vi.useFakeTimers()
		fetchMock.mockReturnValue(new Promise(() => {}))
		// worst case: the task starts at once
		after.mockImplementation(task => {
			task()
		})

		expect(trackWebhookOutcome(request(), purchase())).toBeUndefined()
		expect(trackWebhookOutcome(request(), CANCELLED, () => new Promise(() => {}))).toBeUndefined()
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})
})

// what trackWebhookOutcome relies on for a plan read after the response
describe('trackServerEvent with properties read later', () => {
	it('calls the reader in the task given to after(), then sends what it read', async () => {
		const readData = vi.fn(async () => ({ event: 'cancelled', plan: 'starter', cycle: 'month' }))

		trackServerEvent(request(), 'api-subscription-change', readData)

		expect(after).toHaveBeenCalledTimes(1)
		expect(readData).not.toHaveBeenCalled()
		await runScheduled()

		expect(readData).toHaveBeenCalledTimes(1)
		expect(sentEvents()).toEqual([['api-subscription-change', { event: 'cancelled', plan: 'starter', cycle: 'month' }]])
	})

	it.each([
		['rejects', () => Promise.reject(new Error('Connection terminated'))],
		[
			'throws at once',
			() => {
				throw new Error('boom')
			},
		],
		[
			'reads properties that cannot be serialized',
			async () => {
				const circular = {}
				circular.self = circular
				return circular
			},
		],
	])('sends nothing and does not fail when the reader %s', async (_case, readData) => {
		trackServerEvent(request(), 'api-purchase', readData)

		await expect(runScheduled()).resolves.toBeDefined()
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it('still ignores unknown event names and other hosts', async () => {
		const readData = vi.fn(async () => ({}))

		trackServerEvent(request(), 'api-refund', readData)
		trackServerEvent(request({ host: 'localhost:3000' }), 'api-purchase', readData)

		expect(after).not.toHaveBeenCalled()
		expect(readData).not.toHaveBeenCalled()
	})
})
