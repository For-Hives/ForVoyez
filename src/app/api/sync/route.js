import { cookies } from 'next/headers'

import { syncPlans } from '@/services/database.service'

export async function GET() {
	await syncPlans()

	return new Response('Plans has been Sync', {
		status: 200,
	})
}
