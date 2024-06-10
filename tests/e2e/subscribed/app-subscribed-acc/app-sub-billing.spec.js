const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')

test.describe('Client Logic Billing Functionality for Subscribed User', () => {
	test.beforeEach('redirect to billing', async ({ page }) => {
		await page.goto('/app/billing')
		await expect(page).toHaveURL('/app/billing')
	})

	test('User with subscription is redirected to billing portal', async ({
		page,
	}) => {
		// Wait for the redirect to billing portal
		await page.waitForURL(
			url => url.toString().includes('lemonsqueezy.com/billing'),
			{ timeout: 50000 }
		)

		const currentURL = page.url()
		log(`Navigated to URL: ${currentURL}`)
		expect(currentURL).toContain('lemonsqueezy.com/billing')
	})
})
