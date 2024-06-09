const { expect, test } = require('@playwright/test')
const { getNextPublicUrl, signIn } = require('../../tests-helpers')
require('dotenv').config()

const NEXT_PUBLIC_URL = getNextPublicUrl()
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

const ENABLE_TEST_LOGS = process.env.ENABLE_TEST_LOGS === 'true'

const log = message => {
	if (ENABLE_TEST_LOGS) {
		console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
	}
}

test.describe('Plans Management Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await signIn(page, `app/plans`, NEXT_PUBLIC_URL, TEST_EMAIL, TEST_PASSWORD)
	})

	test('View and manage subscription plans', async ({ page }) => {
		log('Page loaded')

		// Check the visibility of the plans section
		await page.waitForFunction(
			() => {
				const plansSection = document.querySelector(
					'[data-testid="plans-loading"]'
				)
				return plansSection !== null
			},
			{ timeout: 50000 }
		)

		// Wait for the plans to be loaded
		log('Waiting for plans to be loaded')
		await page.waitForFunction(
			() => {
				const plans = document.querySelectorAll('[data-testid^="plan-"]')
				return plans.length > 0
			},
			{ timeout: 50000 }
		)

		// Check if the plans are loaded and displayed correctly
		log('Checking if the plans are loaded and displayed correctly')
		const plans = await page.locator('[data-testid^="plan-"]')
		expect(await plans.count()).toBeGreaterThan(0)

		// Try changing the plan
		log('Attempting to change the plan')
		const changePlanButton = page.locator('a:has-text("Subscribe")').first()
		await changePlanButton.click()

		// Adding more specific logging for plan change process
		log('Clicked on "Subscribe" button, waiting for URL change')

		// Wait for the URL to change to the expected checkout URL
		await page.waitForURL(
			url => url.toString().includes('lemonsqueezy.com/checkout'),
			{ timeout: 50000 }
		)
		const currentURL = page.url()
		log(`Navigated to URL: ${currentURL}`)
		expect(currentURL).toContain('lemonsqueezy.com/checkout')
	})
})
