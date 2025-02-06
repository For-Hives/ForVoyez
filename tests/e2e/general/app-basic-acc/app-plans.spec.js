const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')

test.describe('Plans Management Functionality', () => {
	test.beforeEach('redirect to plans', async ({ page }) => {
		await page.goto('/app/plans')
		await expect(page).toHaveURL('/app/plans')
	})

	test('View and manage subscription plans', async ({ page }) => {
		log('Page loaded')

		// Wait for loading state to disappear
		const loadingElement = page.locator('[data-testid="plans-loading"]')
		await expect(loadingElement).toBeHidden({ timeout: 30000 })

		// Check visible plans
		log('Waiting for plans to be loaded')
		const plans = page.locator('[data-testid^="plan-"]')
		await expect(plans.first()).toBeVisible({ timeout: 30000 })

		const planCount = await plans.count()
		log(`Found ${planCount} plans`)
		expect(planCount).toBeGreaterThan(0)

		// Plan interaction
		log('Attempting to change the plan')
		const changePlanButton = page.locator('a:has-text("Subscribe")').first()
		await changePlanButton.click()

		// Wait for external navigation
		await expect(page).toHaveURL(/lemonsqueezy\.com\/checkout/, {
			waitUntil: 'domcontentloaded',
			timeout: 60000,
		})

		log(`Navigated to checkout: ${page.url()}`)
	})
})
