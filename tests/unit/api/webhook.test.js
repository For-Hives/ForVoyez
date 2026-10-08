// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/webhook/route'
import { createHmac } from 'crypto'

import { processWebhook, saveWebhooks } from '@/services/webhook.service'

vi.mock('@/services/webhook.service')

const SECRET = 'fake-webhook-secret'
const BODY = JSON.stringify({
	data: { attributes: { user_email: 'jane.doe@example.com', customer_id: 1 } },
	meta: { custom_data: { user_id: 'user123' }, event_name: 'order_created' },
})

function signed(body, secret = SECRET) {
	return createHmac('sha256', secret).update(body).digest('hex')
}

function webhookRequest(body, signature) {
	return new Request('http://localhost/api/webhook', {
		headers: signature === undefined ? {} : { 'X-Signature': signature },
		method: 'POST',
		body,
	})
}

describe('POST /api/webhook', () => {
	let consoleError

	beforeEach(() => {
		vi.resetAllMocks()
		vi.spyOn(console, 'info').mockImplementation(() => {})
		consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.stubEnv('LEMON_SQUEEZY_WEBHOOK_SECRET', SECRET)
		saveWebhooks.mockResolvedValue(12)
		processWebhook.mockResolvedValue(undefined)
	})

	afterEach(() => {
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('should answer 500 and store nothing when the secret is not configured', async () => {
		vi.stubEnv('LEMON_SQUEEZY_WEBHOOK_SECRET', '')

		const response = await POST(webhookRequest(BODY, signed(BODY)))

		expect(response.status).toBe(500)
		expect(saveWebhooks).not.toHaveBeenCalled()
	})

	it('should answer 401 for a signature of the wrong length (not a 400 crash)', async () => {
		const response = await POST(webhookRequest(BODY, 'short'))

		expect(response.status).toBe(401)
		expect(saveWebhooks).not.toHaveBeenCalled()
	})

	it('should answer 401 for a missing or forged signature', async () => {
		expect((await POST(webhookRequest(BODY))).status).toBe(401)
		expect(
			(await POST(webhookRequest(BODY, signed(BODY, 'other-secret')))).status
		).toBe(401)
		expect(saveWebhooks).not.toHaveBeenCalled()
	})

	it('should store then process a signed event before answering 200', async () => {
		let processed = false
		processWebhook.mockImplementation(async () => {
			await new Promise(resolve => setTimeout(resolve, 5))
			processed = true
		})

		const response = await POST(webhookRequest(BODY, signed(BODY)))

		expect(response.status).toBe(200)
		expect(saveWebhooks).toHaveBeenCalledWith(JSON.parse(BODY))
		expect(processWebhook).toHaveBeenCalledWith(12)
		expect(processed).toBe(true)
	})

	it('should still answer 200 once stored even if processing throws (no duplicate retry)', async () => {
		processWebhook.mockRejectedValue(new Error('db down'))

		const response = await POST(webhookRequest(BODY, signed(BODY)))

		expect(response.status).toBe(200)
	})

	it('should not log the payload when storing fails', async () => {
		saveWebhooks.mockRejectedValue(new Error(`invalid data ${BODY}`))

		const response = await POST(webhookRequest(BODY, signed(BODY)))

		expect(response.status).toBe(400)
		const logged = consoleError.mock.calls.flat().map(String).join('\n')
		expect(logged).not.toContain('jane.doe@example.com')
		expect(await response.text()).not.toContain('jane.doe@example.com')
	})
})
