const { expect, test } = require('@playwright/test')

const PLAYER_URL = 'https://www.youtube-nocookie.com/embed/tY-C1fPhCtE?autoplay=1'

// What a YouTube iframe makes the browser contact, and where its cookies live.
const VIDEO_HOSTS =
	/(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|ytimg\.com|ggpht\.com|googlevideo\.com|google\.com|gstatic\.com|doubleclick\.net)$/

test.beforeEach(async ({ context, baseURL }) => {
	// Avoid Clerk's development-instance handshake; this is not a session cookie.
	await context.addCookies([{ name: '__clerk_db_jwt', value: 'anonymous-smoke-browser', url: baseURL }])
})

test('the plugin demo video contacts YouTube only once the visitor plays it', async ({ page }) => {
	const requested = []
	// Recorded, then refused: the test never downloads the player.
	await page.route(
		url => VIDEO_HOSTS.test(url.hostname),
		route => {
			requested.push(route.request().url())
			return route.abort()
		}
	)

	await page.goto('/wordpress-plugin')
	const play = page.getByRole('button', { name: 'Play the ForVoyez WordPress plugin demo', exact: true })
	await play.scrollIntoViewIfNeeded()
	// the thumbnail comes from the app, through the image optimizer
	const poster = play.locator('img')
	await expect(poster).toHaveJSProperty('complete', true)
	expect(await poster.evaluate(image => image.naturalWidth)).toBeGreaterThan(0)
	expect(new URL(await poster.evaluate(image => image.currentSrc)).origin).toBe(new URL(page.url()).origin)
	await expect(page.locator('iframe')).toHaveCount(0)
	expect(requested).toEqual([])

	await play.click()

	const player = page.locator('iframe[title="ForVoyez WordPress Plugin Demo"]')
	await expect(player).toHaveAttribute('src', PLAYER_URL)
	await expect(player).toBeFocused()
	await expect(play).toHaveCount(0)
	await expect.poll(() => requested).toEqual([PLAYER_URL])
})
