const { readFileSync } = require('node:fs')
const path = require('node:path')
const { expect, test } = require('@playwright/test')

test('serves the public landing and its security headers from the production build', async ({ request }) => {
	const response = await request.get('/')
	expect(response.status()).toBe(200)
	const html = await response.text()
	expect(html).toContain('Less time writing alt text. More time publishing.')
	expect(response.headers()['x-powered-by']).toBeUndefined()
	expect(response.headers()['x-content-type-options']).toBe('nosniff')
})

test('does not cache unauthenticated account data', async ({ request }) => {
	const response = await request.get('/api/tokens')
	expect(response.status()).toBe(401)
	expect(response.headers()['cache-control']).toBe('private, no-store')
	expect(await response.json()).toEqual({ error: 'Missing or invalid authentication token' })
})

test('keeps the synchronization endpoint unavailable without a secret', async ({ request }) => {
	expect((await request.get('/api/sync?true=true')).status()).toBe(404)
})

// A GET handler that answers without reading the request is prerendered: built
// without SYNC_SECRET, the route used to serve a frozen 404 to every caller.
test('runs the synchronization endpoint at request time, with the runtime secret', async ({ request }) => {
	const manifest = JSON.parse(readFileSync(path.join(__dirname, '../../.next/prerender-manifest.json'), 'utf8'))
	expect(Object.keys(manifest.routes)).toContain('/')
	expect(Object.keys(manifest.routes)).not.toContain('/api/sync')

	const refusals = await Promise.all([
		request.get('/api/sync'),
		request.get('/api/sync', { headers: { 'x-sync-secret': 'not-the-smoke-secret' } }),
	])
	for (const refusal of refusals) {
		expect(refusal.status()).toBe(404)
		expect(refusal.headers()['x-nextjs-cache']).toBeUndefined()
		expect(refusal.headers()['cache-control'] ?? '').not.toContain('s-maxage')
	}

	// The secret is accepted; the sync itself then fails for lack of a Lemon Squeezy key.
	const accepted = await request.get('/api/sync', { headers: { 'x-sync-secret': 'smoke-sync-secret-fixture' } })
	expect(accepted.status()).toBe(500)
	expect(await accepted.text()).toBe('Failed to sync plans')
})

test('protects the dashboard but leaves the legal documents public', async ({ request }) => {
	const dashboard = await request.get('/app/tokens', { maxRedirects: 0 })
	expect([302, 303, 307, 308, 401]).toContain(dashboard.status())
	expect((await request.get('/app/legals/privacy-policy')).status()).toBe(200)
})

for (const path of ['/sign-in', '/sign-up', '/profile']) {
	test(`streams the Clerk route ${path} without a prerender error`, async ({ request }) => {
		const response = await request.get(path)
		expect(response.status()).toBe(200)
		expect(await response.text()).not.toContain('CLIENT_HOOK_DYNAMIC')
	})
}
