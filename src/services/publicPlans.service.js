import { cacheLife, cacheTag } from 'next/cache'
import { getPlans } from '@/services/database.service'

import 'server-only'

// Only the public catalogue is shared across requests. Balances, API keys and
// subscriptions remain uncached and are always read behind authorization.
export async function getPublicPlans() {
	'use cache'
	cacheLife({ stale: 300, revalidate: 60, expire: 3600 })
	cacheTag('plans')
	return await getPlans()
}
