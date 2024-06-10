const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')
require('dotenv').config()

const NEXT_PUBLIC_URL = getNextPublicUrl()
const TEST_EMAIL_SUB = process.env.TEST_EMAIL_SUB
const TEST_PASSWORD_SUB = process.env.TEST_PASSWORD_SUB

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
