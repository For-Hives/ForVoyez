const { expect, test } = require('@playwright/test')

test.beforeEach(async ({ context, baseURL }) => {
	// Avoid Clerk's development-instance handshake; this is not a session cookie.
	await context.addCookies([{ name: '__clerk_db_jwt', value: 'anonymous-smoke-browser', url: baseURL }])
})

test('prerenders the developers section between the plugin section and the pricing', async ({ request }) => {
	const response = await request.get('/')
	expect(response.status()).toBe(200)
	const html = await response.text()

	const plugin = html.indexOf('A simpler routine for your WordPress images')
	const developers = html.indexOf('id="developers"')
	const pricing = html.indexOf('id="pricing"')
	expect(plugin).toBeGreaterThan(-1)
	expect(developers).toBeGreaterThan(plugin)
	expect(pricing).toBeGreaterThan(developers)

	expect(html).toContain('AI-ready for WordPress')
	expect(html).toContain('Developer API')
	// the request sample is static HTML: readable without JavaScript
	expect(html).toContain('https://forvoyez.com/api/describe')
	expect(html).toContain('Authorization: Bearer YOUR_API_KEY')
})

test('links the developers section to the plugin page, the API docs and the playground', async ({ page }) => {
	await page.goto('/')
	const section = page.getByTestId('developers-section')

	await expect(section.getByRole('link', { name: 'See the WordPress plugin', exact: true })).toHaveAttribute(
		'href',
		'/wordpress-plugin'
	)
	await expect(section.getByRole('link', { name: 'Read the API docs', exact: true })).toHaveAttribute(
		'href',
		'https://doc.forvoyez.com/'
	)
	await expect(section.getByRole('link', { name: 'Try the playground', exact: true })).toHaveAttribute(
		'href',
		'/app/playground'
	)
	// our own tracking attribute: Umami's would cancel the client navigation
	await expect(section.locator('[data-fv-event="developers-cta-click"]')).toHaveCount(3)
	await expect(section.locator('[data-umami-event]')).toHaveCount(0)
})
