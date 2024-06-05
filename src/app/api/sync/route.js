import { syncPlans } from '@/services/database.service'

export async function GET() {
	try {
		const result = await syncPlans()

		// Check if the result is valid
		if (!result) {
			throw new Error('No result returned from syncPlans')
		}

		return new Response('Plans have been synced', { status: 200 })
	} catch (error) {
		console.error('Error syncing plans:', error.message)
		return new Response('Failed to sync plans', { status: 500 })
	}
}
