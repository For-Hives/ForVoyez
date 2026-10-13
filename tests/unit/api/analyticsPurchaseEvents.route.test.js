// POST /api/webhook hands what processWebhook reports to the statistics, once
// and only on its way to a 200 (the services themselves are covered by the
// other analyticsPurchaseEvents tests). Both services are mocked here.
// @vitest-environment node

import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/webhook/route'

import { logger } from '@/services/logger.service'
import { trackWebhookOutcome } from '@/services/serverAnalytics.service'
import { getPlanLabel, processWebhook, saveWebhooks } from '@/services/webhook.service'

vi.mock('@/services/webhook.service')
vi.mock('@/services/serverAnalytics.service')

const SECRET = 'fake-webhook-secret'
const BODY = JSON.stringify({
	data: { attributes: { user_email: 'jane.doe@example.com', customer_id: 1 } },
	meta: { custom_data: { user_id: 'user123' }, event_name: 'order_created' },
})
const OUTCOME = {
	plan: { name: '250 credits', billingCycle: null },
	reason: 'first-order',
	type: 'purchase',
	kind: 'refill',
	credits: 250,
}

function delivery(body = BODY, signature = createHmac('sha256', SECRET).update(body).digest('hex')) {
	return new Request('https://forvoyez.com/api/webhook', {
		headers: { 'X-Signature': signature, host: 'forvoyez.com' },
		method: 'POST',
		body,
	})
}

// processWebhook as the service behaves: it reports what the event did, then
// resolves (or not, for the cases that must never happen)
function processingReports(outcome, result = true) {
	processWebhook.mockImplementation(async (_id, onProcessed) => {
		onProcessed(outcome)
		if (result instanceof Error) throw result
		return result
	})
}

describe('POST /api/webhook statistics', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		vi.spyOn(logger, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.stubEnv('LEMON_SQUEEZY_WEBHOOK_SECRET', SECRET)
		saveWebhooks.mockResolvedValue(12)
		processWebhook.mockResolvedValue(true)
	})

	afterEach(() => {
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('reports what the event did, with its own request and the plan reader of the webhook service', async () => {
		processingReports(OUTCOME)
		const request = delivery()

		const response = await POST(request)

		expect(response.status).toBe(200)
		expect(await response.text()).toBe('Success!')
		expect(processWebhook).toHaveBeenCalledWith(12, expect.any(Function))
		expect(trackWebhookOutcome).toHaveBeenCalledTimes(1)
		expect(trackWebhookOutcome).toHaveBeenCalledWith(request, OUTCOME, getPlanLabel)
		// reading a plan is left to the statistics, after the response
		expect(getPlanLabel).not.toHaveBeenCalled()
	})

	it('reports nothing when processing reports nothing: a duplicate delivery, or an event that changed nothing', async () => {
		const response = await POST(delivery())

		expect(response.status).toBe(200)
		expect(processWebhook).toHaveBeenCalledTimes(1)
		expect(trackWebhookOutcome).not.toHaveBeenCalled()
	})

	it.each([
		['fails', false],
		['throws', new Error('db down')],
	])('reports nothing when processing %s, even if it reported something first', async (_case, result) => {
		processingReports(OUTCOME, result)

		const response = await POST(delivery())

		expect(response.status).toBe(500)
		expect(trackWebhookOutcome).not.toHaveBeenCalled()
	})

	it.each([
		['an unsigned delivery', () => delivery(BODY, ''), 401],
		['a forged signature', () => delivery(BODY, createHmac('sha256', 'other').update(BODY).digest('hex')), 401],
		['a payload that is not JSON', () => delivery('{"meta": '), 400],
		['a payload without a user', () => delivery(JSON.stringify({ meta: { event_name: 'order_created' } })), 400],
	])('neither processes nor reports %s', async (_case, request, status) => {
		const response = await POST(request())

		expect(response.status).toBe(status)
		expect(saveWebhooks).not.toHaveBeenCalled()
		expect(processWebhook).not.toHaveBeenCalled()
		expect(trackWebhookOutcome).not.toHaveBeenCalled()
	})

	it('reports nothing when the secret is missing or the event cannot be stored', async () => {
		processingReports(OUTCOME)

		saveWebhooks.mockRejectedValueOnce(new Error('Connection refused'))
		expect((await POST(delivery())).status).toBe(500)

		vi.stubEnv('LEMON_SQUEEZY_WEBHOOK_SECRET', '')
		expect((await POST(delivery())).status).toBe(500)

		expect(processWebhook).not.toHaveBeenCalled()
		expect(trackWebhookOutcome).not.toHaveBeenCalled()
	})

	it('does not wait for the statistics before answering', async () => {
		processingReports(OUTCOME)
		// whatever the helper returns is ignored, even a promise that never settles
		trackWebhookOutcome.mockReturnValue(new Promise(() => {}))

		const response = await POST(delivery())

		expect(response.status).toBe(200)
		expect(trackWebhookOutcome).toHaveBeenCalledTimes(1)
	})
})
