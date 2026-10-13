import { timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import { syncPlans } from '@/services/database.service'
import { logger } from '@/services/logger.service'

/**
 * Syncs the Lemon Squeezy products/variants into the Plan table.
 * Requires the `x-sync-secret` header to equal the `SYNC_SECRET` env var.
 * Answers 404 when `SYNC_SECRET` is unset or the secret is missing/wrong, so
 * the route is invisible to anyone without the secret.
 */
export async function GET(request) {
	// Never prerendered nor cached: every call is an authenticated trigger. With
	// cacheComponents, a GET handler that answers before reading the request is
	// prerendered: a build without SYNC_SECRET froze the 404 below, whatever the
	// runtime environment said. Reading the header first keeps the route dynamic.
	const providedSecret = request.headers.get('x-sync-secret')

	const expectedSecret = process.env.SYNC_SECRET
	if (!expectedSecret) {
		return notFound()
	}

	if (!isSameSecret(providedSecret, expectedSecret)) {
		console.error('Plan sync refused: missing or invalid x-sync-secret')
		return notFound()
	}

	try {
		logger.info('Plan Syncing Started')
		await syncPlans()
		// Route Handlers use explicit expiration; updateTag is for Server Actions.
		revalidateTag('plans', { expire: 0 })

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

	return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer)
}

function notFound() {
	return new Response('Not Found', { status: 404 })
}
