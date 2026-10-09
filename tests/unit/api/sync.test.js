// @vitest-environment node
import { revalidateTag } from 'next/cache'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/sync/route'
import { syncPlans } from '@/services/database.service'
import { logger } from '@/services/logger.service'

vi.mock('@/services/database.service')

const SECRET = 'fake-sync-secret-for-tests'

function syncRequest(headers = {}, query = '') {
	return new Request(`http://localhost/api/sync${query}`, { headers })
}

describe('GET /api/sync', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		vi.spyOn(logger, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		syncPlans.mockResolvedValue([])
	})

	afterEach(() => {
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('should answer 404 when SYNC_SECRET is not set, even with a header', async () => {
		vi.stubEnv('SYNC_SECRET', '')

		const response = await GET(syncRequest({ 'x-sync-secret': 'anything' }))

		expect(response.status).toBe(404)
		expect(syncPlans).not.toHaveBeenCalled()
	})

	it('should answer 404 without the header (the old ?true=true trigger is gone)', async () => {
		vi.stubEnv('SYNC_SECRET', SECRET)

		const response = await GET(syncRequest({}, '?true=true'))

		expect(response.status).toBe(404)
		expect(syncPlans).not.toHaveBeenCalled()
	})

	it('should answer 404 for a wrong secret', async () => {
		vi.stubEnv('SYNC_SECRET', SECRET)

		const wrongLength = await GET(syncRequest({ 'x-sync-secret': 'nope' }))
		const sameLength = await GET(syncRequest({ 'x-sync-secret': SECRET.replace('f', 'g') }))

		expect(wrongLength.status).toBe(404)
		expect(sameLength.status).toBe(404)
		expect(syncPlans).not.toHaveBeenCalled()
	})

	it('should sync the plans with the right secret', async () => {
		vi.stubEnv('SYNC_SECRET', SECRET)

		const response = await GET(syncRequest({ 'x-sync-secret': SECRET }))

		expect(response.status).toBe(200)
		expect(syncPlans).toHaveBeenCalledTimes(1)
		expect(revalidateTag).toHaveBeenCalledWith('plans', { expire: 0 })
	})

	it('should answer 500 when the sync fails', async () => {
		vi.stubEnv('SYNC_SECRET', SECRET)
		syncPlans.mockRejectedValue(new Error('Lemon Squeezy down'))

		const response = await GET(syncRequest({ 'x-sync-secret': SECRET }))

		expect(response.status).toBe(500)
		expect(revalidateTag).not.toHaveBeenCalled()
	})
})
