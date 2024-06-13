const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')

test.describe('Plans Management Functionality', () => {
	test.beforeEach('redirect to plans', async ({ page }) => {
		await page.goto('/app/plans')
		await expect(page).toHaveURL('/app/plans')
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
