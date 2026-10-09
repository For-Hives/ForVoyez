import { logger } from '@/services/logger.service'
// @vitest-environment node

import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/webhook/route'

import { database } from '/tests/unit/mocks/webhook-idempotency.db'

// The route with the real webhook and database services, on an in-memory
// database whose transactions roll back and whose advisory lock blocks.
vi.mock('@/services/lemonsqueezy.service')
vi.mock('@/services/prisma.service', async () => {
	const { database } = await vi.importActual('/tests/unit/mocks/webhook-idempotency.db')
	return { prisma: database.client }
})

const SECRET = 'fake-webhook-secret'
const CUSTOMER = { user_email: 'jane.doe@example.com', user_name: 'Jane Doe' }
const PACK = { variantId: 'v-pack', billingCycle: null, packageSize: 50, id: 3 }

// a signed Lemon Squeezy delivery of `body`
function delivery(body) {
	return new Request('http://localhost/api/webhook', {
		headers: {
			'X-Signature': createHmac('sha256', SECRET).update(body).digest('hex'),
		},
		method: 'POST',
		body,
	})
}

function lastEvent() {
	return database.events().at(-1)
}

function orderCreated(userId = 'user123') {
	return JSON.stringify({
		data: {
			attributes: {
				first_order_item: { variant_id: PACK.variantId },
				customer_id: 42,
				status: 'paid',
				...CUSTOMER,
			},
			type: 'orders',
			id: 'order-1',
		},
		meta: { custom_data: { user_id: userId }, event_name: 'order_created' },
	})
}

describe('POST /api/webhook: retries and duplicates', () => {
	let consoleInfo
	let consoleError

	beforeEach(() => {
		database.reset()
		database.tables.plan.push(PACK)
		database.tables.user.push({
			clerkId: 'user123',
			customerId: 42,
			credits: 0,
		})
		vi.stubEnv('LEMON_SQUEEZY_WEBHOOK_SECRET', SECRET)
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
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('answers 500 and stores the error when processing fails, then credits once when Lemon Squeezy retries', async () => {
		database.tables.plan.length = 0 // plans not synced yet

		const failed = await POST(delivery(orderCreated()))

		expect(failed.status).toBe(500)
		expect(lastEvent()).toMatchObject({
			processingError: expect.stringContaining('Plan not found for variant v-pack'),
			processed: false,
		})
		expect(consoleError).toHaveBeenCalledWith(
			`webhook ${lastEvent().id} (order_created) not processed, answering 500 so Lemon Squeezy retries it; the error is in WebhookEvent.processingError`
		)
		expect(database.credits('user123')).toBe(0)

		database.tables.plan.push(PACK) // /api/sync
		const retried = await POST(delivery(orderCreated()))
		const retriedAgain = await POST(delivery(orderCreated()))

		expect([retried.status, retriedAgain.status]).toEqual([200, 200])
		expect(database.credits('user123')).toBe(PACK.packageSize)
		expect(database.tables.usage).toHaveLength(1)
		expect(lastEvent().processingError).toContain('Duplicate of webhook event')
	})

	it.each(['user.update', 'usage.create', 'webhookEvent.update'])(
		'answers 500 without crediting when %s fails, and the retry credits once',
		async failingCall => {
			database.failOnce(failingCall, new Error('Connection terminated'))

			const failed = await POST(delivery(orderCreated()))

			expect(failed.status).toBe(500)
			expect(database.credits('user123')).toBe(0)
			expect(lastEvent()).toMatchObject({
				processingError: 'Connection terminated',
				processed: false,
			})

			const retried = await POST(delivery(orderCreated()))

			expect(retried.status).toBe(200)
			expect(database.credits('user123')).toBe(PACK.packageSize)
			expect(database.tables.usage).toHaveLength(1)
		}
	)

	it('answers 200 to two deliveries arriving at the same time, and credits once', async () => {
		const responses = await Promise.all([POST(delivery(orderCreated())), POST(delivery(orderCreated()))])

		expect(responses.map(response => response.status)).toEqual([200, 200])
		expect(database.credits('user123')).toBe(PACK.packageSize)
		expect(database.tables.usage).toHaveLength(1)
	})

	it('stores and credits the order of a user who has no User row yet', async () => {
		const response = await POST(delivery(orderCreated('user-new')))

		expect(response.status).toBe(200)
		expect(database.credits('user-new')).toBe(PACK.packageSize)
	})

	it('answers 500 when the event cannot be stored, so Lemon Squeezy retries', async () => {
		database.failOnce('webhookEvent.create', new Error('Connection refused'))

		const response = await POST(delivery(orderCreated()))

		expect(response.status).toBe(500)
		expect(database.events()).toHaveLength(0)
	})

	describe('malformed payloads', () => {
		const withoutUser = JSON.parse(orderCreated())
		delete withoutUser.meta.custom_data
		const withoutName = JSON.parse(orderCreated())
		delete withoutName.meta.event_name
		const withoutData = JSON.parse(orderCreated())
		delete withoutData.data

		it.each([
			['not JSON', '{"meta": '],
			['without custom_data.user_id', JSON.stringify(withoutUser)],
			['without event_name', JSON.stringify(withoutName)],
			['without data', JSON.stringify(withoutData)],
		])('answers 400 to a payload %s and stores nothing', async (_case, body) => {
			const response = await POST(delivery(body))

			expect(response.status).toBe(400)
			expect(database.events()).toHaveLength(0)
			expect(database.tables.user).toHaveLength(1)
		})
	})

	it('still answers 401 to an unsigned delivery, and stores nothing', async () => {
		const response = await POST(
			new Request('http://localhost/api/webhook', {
				body: orderCreated(),
				method: 'POST',
			})
		)

		expect(response.status).toBe(401)
		expect(database.events()).toHaveLength(0)
	})
})
