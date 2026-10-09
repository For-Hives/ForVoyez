import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/sync/route'
import { getPlans, syncPlans } from '@/services/database.service'
import { getPublicPlans } from '@/services/publicPlans.service'

vi.mock('@/services/database.service')

describe('public catalog cache policy', () => {
	beforeEach(() => vi.resetAllMocks())

	it('caches only the public catalog with a bounded lifetime and invalidation tag', async () => {
		getPlans.mockResolvedValue([{ variantId: 'public' }])
		expect(await getPublicPlans()).toEqual([{ variantId: 'public' }])
		expect(cacheLife).toHaveBeenCalledWith({ stale: 300, revalidate: 60, expire: 3600 })
		expect(cacheTag).toHaveBeenCalledWith('plans')
		expect(getPlans).toHaveBeenCalledWith()
	})

	it('propagates database failures instead of caching an empty catalog', async () => {
		getPlans.mockRejectedValue(new Error('database unavailable'))
		await expect(getPublicPlans()).rejects.toThrow('database unavailable')
	})

	it('does not invalidate a catalog after an unauthorized synchronization', async () => {
		const response = await GET(new Request('http://localhost/api/sync'))
		expect(response.status).toBe(404)
		expect(syncPlans).not.toHaveBeenCalled()
		expect(revalidateTag).not.toHaveBeenCalled()
	})
})
