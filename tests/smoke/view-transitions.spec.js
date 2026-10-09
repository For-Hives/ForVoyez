const { expect, test } = require('@playwright/test')

test.beforeEach(async ({ context }) => {
	// Avoid Clerk's development-instance handshake; this is not a session cookie.
	await context.addCookies([{ name: '__clerk_db_jwt', value: 'anonymous-smoke-browser', url: 'http://127.0.0.1:3041' }])
})

async function observeTransitions(page) {
	await page.addInitScript(() => {
		window.observedTransitions = []
		const nativeStart = document.startViewTransition.bind(document)
		document.startViewTransition = (...args) => {
			const result = nativeStart(...args)
			const observation = { ready: false, error: null }
			window.observedTransitions.push(observation)
			result.ready.then(
				() => {
					observation.ready = true
					observation.animations = document
						.getAnimations()
						.filter(
							animation =>
								typeof animation.animationName === 'string' &&
								animation.effect?.pseudoElement?.startsWith('::view-transition')
						)
						.map(animation => animation.animationName)
					observation.resourceDuration = getComputedStyle(
						document.documentElement,
						'::view-transition-group(resource-legals-terms-title)'
					).animationDuration
					observation.pluginDuration = getComputedStyle(
						document.documentElement,
						'::view-transition-group(wordpress-plugin-title)'
					).animationDuration
				},
				error => {
					observation.error = error.message
				}
			)
			return result
		}
	})
}

test('native transition completes and browser history preserves navigation', async ({ page }) => {
	await observeTransitions(page)
	await page.goto('/')
	await page.getByTestId('nav-contact').first().click()
	await expect(page).toHaveURL('/contact')
	await expect(page.getByRole('heading', { name: 'Need a hand with your WordPress images?' })).toBeVisible()
	await expect
		.poll(() => page.evaluate(() => window.observedTransitions.filter(item => item.ready).length))
		.toBeGreaterThan(0)
	await page.goBack()
	await expect(page).toHaveURL('/')
	await page.goForward()
	await expect(page).toHaveURL('/contact')
	expect(await page.evaluate(() => window.observedTransitions.filter(item => item.error))).toEqual([])
})

test('plugin shared content transitions without duplicate names', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1600 })
	const pluginPrefetches = []
	page.on('response', response => {
		if (response.request().headers().rsc === '1' && new URL(response.url()).pathname.startsWith('/wordpress-plugin')) {
			pluginPrefetches.push(response.finished().then(error => !error && response.ok()))
		}
	})
	await observeTransitions(page)
	await page.goto('/')
	await expect(page.getByRole('link', { name: 'Get the WordPress plugin', exact: true })).toHaveAttribute(
		'href',
		'/wordpress-plugin'
	)
	await page.screenshot({ path: '/tmp/forvoyez-marketing-home.png' })
	const pluginLink = page.getByRole('link', { name: 'Explore the WordPress plugin' })
	const sharedTitle = page.getByText('A simpler routine for your WordPress images', { exact: true })
	await sharedTitle.evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }))
	await expect(sharedTitle).toBeInViewport({ ratio: 1 })
	await expect(pluginLink).toBeInViewport({ ratio: 1 })
	await pluginLink.hover()
	// Shared pairs require a visible source and a destination ready in the same commit.
	await expect.poll(async () => (await Promise.all(pluginPrefetches)).some(Boolean), { timeout: 15000 }).toBe(true)
	await pluginLink.click()
	await expect(page).toHaveURL('/wordpress-plugin')
	await expect(page.getByRole('heading', { name: 'Image descriptions, handled right inside WordPress.' })).toBeVisible()
	await expect
		.poll(() => page.evaluate(() => window.observedTransitions.filter(item => item.ready).length))
		.toBeGreaterThan(0)
	expect(await page.evaluate(() => window.observedTransitions.filter(item => item.error))).toEqual([])
	expect(await page.evaluate(() => window.observedTransitions)).toEqual(
		expect.arrayContaining([expect.objectContaining({ pluginDuration: '0.28s' })])
	)
	await expect(page.getByRole('link', { name: 'Install the WordPress plugin', exact: true }).first()).toHaveAttribute(
		'href',
		'https://wordpress.org/plugins/auto-alt-text-for-images/'
	)
	await page.getByRole('link', { name: 'See the setup steps' }).click()
	await expect(page).toHaveURL('/wordpress-plugin#how-it-works')
	await expect(page.getByRole('link', { name: 'Get your connection key' })).toHaveAttribute('href', '/app/tokens')
	await page.getByRole('button', { name: 'Is the plugin free?', exact: true }).click()
	await expect(page.getByText('The WordPress plugin is free to install.', { exact: false })).toBeVisible()
})

test('reduced motion disables native transition animation', async ({ page }) => {
	await observeTransitions(page)
	await page.emulateMedia({ reducedMotion: 'reduce' })
	await page.goto('/')
	await page.getByTestId('nav-contact').first().click()
	await expect(page).toHaveURL('/contact')
	await expect
		.poll(() => page.evaluate(() => window.observedTransitions.filter(item => item.ready).length))
		.toBeGreaterThan(0)
	expect(await page.evaluate(() => window.observedTransitions.flatMap(item => item.animations))).toEqual([])
})

test('navigation works without the browser View Transitions API', async ({ page }) => {
	await page.addInitScript(() => {
		document.startViewTransition = undefined
	})
	await page.goto('/')
	await page.getByTestId('nav-contact').first().click()
	await expect(page).toHaveURL('/contact')
	await expect(page.getByRole('heading', { name: 'Need a hand with your WordPress images?' })).toBeVisible()
})

test('mobile menu navigation completes without conflicting logo identities', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await observeTransitions(page)
	await page.goto('/')
	await page.getByTestId('menu-open-button').click()
	await page.getByTestId('mobile-menu-dialog').getByRole('link', { name: 'Contact', exact: true }).click()
	await expect(page).toHaveURL('/contact')
	await expect(page.getByRole('heading', { name: 'Need a hand with your WordPress images?' })).toBeVisible()
	await expect
		.poll(() => page.evaluate(() => window.observedTransitions.filter(item => item.ready).length))
		.toBeGreaterThan(0)
	expect(await page.evaluate(() => window.observedTransitions.filter(item => item.error))).toEqual([])
})

test('dashboard resource card morphs into its destination heading', async ({ page }) => {
	await observeTransitions(page)
	await page.goto('/app/legals')
	await page.getByTestId('link-terms-of-service').getByRole('link').click()
	await expect(page).toHaveURL('/app/legals/terms')
	await expect(page.getByRole('heading', { name: 'Terms of Service', exact: true })).toBeVisible()
	await expect
		.poll(() => page.evaluate(() => window.observedTransitions.filter(item => item.ready).length))
		.toBeGreaterThan(0)
	expect(await page.evaluate(() => window.observedTransitions.filter(item => item.error))).toEqual([])
	expect(await page.evaluate(() => window.observedTransitions.some(item => item.resourceDuration === '0.28s'))).toBe(
		true
	)
})
