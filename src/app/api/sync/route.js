import { syncPlans } from '@/services/database.service'

export const dynamic = 'auto'
export const dynamicParams = true
export const revalidate = false
export const fetchCache = 'auto'

export async function GET(request) {
	// TODO : Clear the cache honneypot with nextjs 15
	try {
		const searchParams = request.nextUrl.searchParams
		const trigger = searchParams.get('true') === 'true'

		if (trigger) {
			console.info('Plan Syncing Started')
			const result = await syncPlans()

			return new Response('Plans have been synced', { status: 200 })

			// Check if the result is valid
			if (!result) {
				throw new Error('No result returned from syncPlans')
			}
		}

		return new Response('cache honneypot', { status: 200 })
	} catch (error) {
		console.error('Error syncing plans:', error.message)
		return new Response('Failed to sync plans', { status: 500 })
	}
}
