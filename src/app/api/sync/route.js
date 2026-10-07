import { timingSafeEqual } from 'crypto'

import { syncPlans } from '@/services/database.service'

// never prerendered nor cached: every call is an authenticated trigger
export const dynamic = 'force-dynamic'

/**
 * Syncs the Lemon Squeezy products/variants into the Plan table.
 * Requires the `x-sync-secret` header to equal the `SYNC_SECRET` env var.
 * Answers 404 when `SYNC_SECRET` is unset or the secret is missing/wrong, so
 * the route is invisible to anyone without the secret.
 */
export async function GET(request) {
	const expectedSecret = process.env.SYNC_SECRET
	if (!expectedSecret) {
		return notFound()
	}

	const providedSecret = request.headers.get('x-sync-secret')
	if (!isSameSecret(providedSecret, expectedSecret)) {
		console.error('Plan sync refused: missing or invalid x-sync-secret')
		return notFound()
	}

	try {
		console.info('Plan Syncing Started')
		await syncPlans()

		return new Response('Plans have been synced', { status: 200 })
	} catch (error) {
		console.error('Error syncing plans:', error.message)
		return new Response('Failed to sync plans', { status: 500 })
	}
}

function isSameSecret(provided, expected) {
	if (!provided) {
		return false
	}

	const providedBuffer = Buffer.from(provided, 'utf8')
	const expectedBuffer = Buffer.from(expected, 'utf8')

	return (
		providedBuffer.length === expectedBuffer.length &&
		timingSafeEqual(providedBuffer, expectedBuffer)
	)
}

function notFound() {
	return new Response('Not Found', { status: 404 })
}
