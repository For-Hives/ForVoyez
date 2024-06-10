const { expect, test } = require('@playwright/test')
const { getNextPublicUrl, log } = require('../../tests-helpers')

test.describe('Pricing Component', () => {
	test('Pricing section loads correctly', async ({ page }) => {
		await page.goto(getNextPublicUrl())

		log('Page loaded')

		// Check the visibility of the pricing section
		const pricingSection = page.locator('[data-testid="pricing-section"]')
		log('Checking visibility of pricing section')
		await expect(pricingSection).toBeVisible()

		// Check the title and description of the pricing section
		const pricingTitle = await pricingSection.locator('h2')
		log('Checking pricing section title')
		await expect(pricingTitle).toBeVisible()
		await expect(pricingTitle).toHaveText('Pricing')

		const pricingSubtitle = await pricingSection.locator(
			'p:has-text("Plans for every stage of your growth")'
		)
		log('Checking pricing section subtitle')
		await expect(pricingSubtitle).toBeVisible()

		const pricingDescription = await page.locator(
			'p:has-text("Choose the plan that fits your needs and scale as your usage grows. Upgrade, downgrade, or cancel anytime.")'
		)
		log('Checking pricing section description')
		await expect(pricingDescription).toBeVisible()
	})

	test('Payment frequency options are present and functional', async ({
		page,
	}) => {
		await page.goto('/')

		log('Page loaded')

		const frequencyMonthly = page.locator('[data-testid="frequency-monthly"]')
		const frequencyAnnually = page.locator('[data-testid="frequency-annually"]')

		log('Checking presence of payment frequency options')
		await expect(frequencyMonthly).toBeVisible()
		await expect(frequencyAnnually).toBeVisible()

		log('Selecting annually payment frequency')
		await frequencyAnnually.click()
		await expect(frequencyAnnually).toHaveClass(
			/bg-forvoyez_orange-500 text-white/
		)

		log('Selecting monthly payment frequency')
		await frequencyMonthly.click()
		await expect(frequencyMonthly).toHaveClass(
			/bg-forvoyez_orange-500 text-white/
		)
	})

	test('Pricing plans are displayed correctly based on selected frequency', async ({
		page,
	}) => {
		await page.goto('/')

		log('Page loaded')

		// Wait for the plans to be loaded
		log('Waiting for plans to be loaded')
		await page.waitForFunction(
			() => {
				const plans = document.querySelectorAll('[data-testid^="plan-"]')
				return plans.length > 0
			},
			{ timeout: 20000 }
		)

		// Set the frequency to monthly
		log('Setting frequency to monthly')
		const frequencyMonthly = page.locator('[data-testid="frequency-monthly"]')
		await frequencyMonthly.click()

		// Check if monthly plans are displayed
		log('Checking if monthly plans are displayed')
		await page.waitForSelector('[data-testid="plan-month"]')
		const monthlyPlans = page.locator('[data-testid="plan-month"]')
		await expect(monthlyPlans.first()).toBeVisible()

		// Set the frequency to annually
		log('Setting frequency to annually')
		const frequencyAnnually = page.locator('[data-testid="frequency-annually"]')
		await frequencyAnnually.click()

		// Check if annual plans are displayed
		log('Checking if annual plans are displayed')
		await page.waitForSelector('[data-testid="plan-year"]')
		const annualPlans = page.locator('[data-testid="plan-year"]')
		await expect(annualPlans.first()).toBeVisible()
	})
})
