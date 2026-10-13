// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/sync/route'
import { syncPlans } from '@/services/database.service'

vi.mock('@/services/database.service')

// With cacheComponents, Next prerenders a GET handler that answers without
// reading the request: a build without SYNC_SECRET froze the 404 for every
// caller, even once the secret was set at runtime. During that prerender the
// first read of the request interrupts the handler, as `interruptedRequest` does.
describe('GET /api/sync stays a request-time route', () => {
	const interruption = new Error('prerender interrupted: the request was read')
	const interruptedRequest = {
		headers: {
			get() {
				throw interruption
			},
		},
	}

	beforeEach(() => {
		vi.resetAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('reads the request before answering 404 when SYNC_SECRET is not set', async () => {
		vi.stubEnv('SYNC_SECRET', '')

		await expect(GET(interruptedRequest)).rejects.toBe(interruption)
		expect(syncPlans).not.toHaveBeenCalled()
	})

	it('reads the request before comparing when SYNC_SECRET is set', async () => {
		vi.stubEnv('SYNC_SECRET', 'fake-sync-secret-for-tests')

		await expect(GET(interruptedRequest)).rejects.toBe(interruption)
		expect(syncPlans).not.toHaveBeenCalled()
	})

	it('only reads the secret header, and still answers 404 without SYNC_SECRET', async () => {
		vi.stubEnv('SYNC_SECRET', '')
		const get = vi.fn(() => 'anything')

		const response = await GET({ headers: { get } })

		expect(get.mock.calls).toEqual([['x-sync-secret']])
		expect(response.status).toBe(404)
		expect(await response.text()).toBe('Not Found')
		expect(syncPlans).not.toHaveBeenCalled()
	})
})
