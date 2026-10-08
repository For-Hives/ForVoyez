// Full-page screenshots of the dashboard pages for one test account, one test
// per page. They are saved to e2e-screenshots/<account>/<page>.png (CI uploads
// the folder as the `e2e-screenshots` artifact) and attached to the report.
// The account comes from the Playwright project (see auth/fixtures.js).
const path = require('path')
const fs = require('fs')

const { expect, test } = require('./auth/fixtures')

const SCREENSHOTS_DIR = path.resolve(__dirname, '../../e2e-screenshots')

// Each page with what shows it is rendered (role and label selectors, with
// generous timeouts: the data comes from server actions after the load).
const PAGES = [
	{
		ready: page =>
			page.getByRole('heading', {
				name: 'Welcome to the ForVoyez Developer Platform',
				level: 1,
			}),
		name: 'dashboard',
		path: '/app',
	},
	{
		ready: page => page.getByRole('button', { name: 'Add token' }),
		path: '/app/tokens',
		name: 'tokens',
	},
	{
		ready: page => page.getByRole('button', { name: 'Analyze your image' }),
		path: '/app/playground',
		name: 'playground',
	},
	{
		ready: page =>
			page
				.getByTestId('usage-chart-container')
				.or(page.getByTestId('no-usage-data'))
				.first(),
		path: '/app/usage',
		name: 'usage',
	},
	{
		ready: page => page.locator('[data-testid^="plan-"]').first(),
		path: '/app/plans',
		name: 'plans',
	},
]

function describeDashboardScreenshots(account) {
	test.describe(`Dashboard screenshots (${account} account)`, () => {
		for (const { path: url, ready, name } of PAGES) {
			test(`${url}`, async ({ page }, testInfo) => {
				test.setTimeout(90_000)

				await page.goto(url)
				await expect(page).toHaveURL(url)
				await expect(ready(page)).toBeVisible({ timeout: 45_000 })
				// let the charts and the transitions settle
				await page.waitForTimeout(1500)

				await saveScreenshot(page, testInfo, account, name)
			})
		}

		// The billing page sends the visitor elsewhere: to the plans with a
		// toast without a Lemon Squeezy customer, to the Lemon Squeezy customer
		// portal otherwise. That portal is a third-party page with the account's
		// billing details: the navigation to it is blocked and recorded, and the
		// screenshot shows our page.
		test('/app/billing', async ({ page }, testInfo) => {
			test.setTimeout(90_000)
			let portalHost = null
			await page.route(/lemonsqueezy\.com/, route => {
				portalHost = new URL(route.request().url()).host
				return route.abort()
			})

			await page.goto('/app/billing')
			await expect(
				page.getByRole('heading', {
					name: 'Billing & Invoice Management',
					level: 1,
				})
			).toBeVisible({ timeout: 45_000 })
			await expect
				.poll(() => portalHost !== null || page.url().includes('/app/plans'), {
					timeout: 45_000,
				})
				.toBe(true)
			if (page.url().includes('/app/plans')) {
				await expect(
					page.locator('[data-testid^="plan-"]').first()
				).toBeVisible({ timeout: 45_000 })
			}
			await page.waitForTimeout(1500)

			testInfo.annotations.push({
				description: portalHost
					? `redirect to ${portalHost} (blocked)`
					: page.url(),
				type: 'billing',
			})
			await saveScreenshot(page, testInfo, account, 'billing')
		})
	})
}

async function saveScreenshot(page, testInfo, account, name) {
	const file = path.join(SCREENSHOTS_DIR, account, `${name}.png`)
	fs.mkdirSync(path.dirname(file), { recursive: true })
	await page.screenshot({ animations: 'disabled', fullPage: true, path: file })
	await testInfo.attach(`${account}-${name}`, {
		contentType: 'image/png',
		path: file,
	})
}

module.exports = { describeDashboardScreenshots, SCREENSHOTS_DIR }
