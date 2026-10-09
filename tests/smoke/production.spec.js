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
