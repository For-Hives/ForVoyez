import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { alertAiFailure, blockingAiFailure, TestingExports } from '@/services/opsAlert.service'

describe('blockingAiFailure', () => {
	it('flags the errors no retry fixes', () => {
		expect(
			blockingAiFailure({ errorCode: 'credit_balance_exhausted', errorType: 'insufficient_quota', statusCode: 429 })
		).toBe('credit_balance_exhausted')
		expect(blockingAiFailure({ errorType: 'insufficient_quota', statusCode: 429 })).toBe('insufficient_quota')
		expect(blockingAiFailure({ statusCode: 401 })).toBe('invalid_api_key')
	})

	it('ignores transient errors', () => {
		expect(blockingAiFailure({ errorCode: 'rate_limit_exceeded', statusCode: 429 })).toBeNull()
		expect(blockingAiFailure({ statusCode: 500 })).toBeNull()
		expect(blockingAiFailure({})).toBeNull()
	})
})

describe('alertAiFailure', () => {
	const fetchMock = vi.fn()

	beforeEach(() => {
		TestingExports.reset()
		fetchMock.mockReset().mockResolvedValue({ ok: true, status: 204 })
		vi.stubGlobal('fetch', fetchMock)
		vi.stubEnv('OPS_DISCORD_WEBHOOK_URL', 'https://discord.example/webhook')
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.unstubAllEnvs()
	})

	it('posts once, then stays quiet for an hour', async () => {
		const t0 = 1_000_000
		expect(await alertAiFailure('credit_balance_exhausted', { model: 'gpt-6-luna' }, t0)).toBe(true)
		expect(await alertAiFailure('credit_balance_exhausted', {}, t0 + 59 * 60_000)).toBe(false)
		expect(fetchMock).toHaveBeenCalledTimes(1)
		const [url, init] = fetchMock.mock.calls[0]
		expect(url).toBe('https://discord.example/webhook')
		expect(JSON.parse(init.body).content).toContain('credit_balance_exhausted')
		expect(await alertAiFailure('credit_balance_exhausted', {}, t0 + 61 * 60_000)).toBe(true)
	})

	it('sends nothing without a webhook', async () => {
		vi.stubEnv('OPS_DISCORD_WEBHOOK_URL', '')
		expect(await alertAiFailure('credit_balance_exhausted')).toBe(false)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it('never throws when Discord fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'))
		await expect(alertAiFailure('invalid_api_key')).resolves.toBe(false)
	})
})
