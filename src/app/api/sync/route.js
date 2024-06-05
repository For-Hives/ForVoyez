import { syncPlans } from '@/services/database.service'

export async function GET() {
	try {
		const result = await syncPlans()

		if (!result || !result.attributes) {
			throw new Error('Attributes are missing in the syncPlans result')
		}

		return new Response('Plans have been synced', { status: 200 })
	} catch (error) {
		console.error('Error syncing plans:', error.message)
		return new Response('Failed to sync plans', { status: 500 })
	}
}
