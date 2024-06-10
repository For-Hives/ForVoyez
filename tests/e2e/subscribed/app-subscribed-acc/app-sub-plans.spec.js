const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')
require('dotenv').config()

test.describe('Plans Management Functionality', () => {
	test.beforeEach('redirect to plans', async ({ page }) => {
		await page.goto('/app/plans')
		await expect(page).toHaveURL('/app/plans')
	})

	test('View and manage subscription plans as subscribed user', async ({
		page,
	}) => {
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

		// Verify the presence of "Manage my Subscription" and "Change Plan" buttons
		log(
			'Verifying presence of "Manage my Subscription" and "Change Plan" buttons'
		)
		const manageSubscriptionButton = page.locator(
			'a:has-text("Manage my Subscription")'
		)
		const changePlanButton = page.locator('a:has-text("Change Plan")')

		await expect(manageSubscriptionButton).toBeVisible()
		await expect(changePlanButton).toBeVisible()

		// Verify the links are present and correct
		log('Verifying the links are present and correct')
		const manageSubscriptionLink =
			await manageSubscriptionButton.getAttribute('href')
		const changePlanLink = await changePlanButton.getAttribute('href')

		expect(manageSubscriptionLink).toContain(
			'https://forvoyez.lemonsqueezy.com/billing'
		)
		expect(changePlanLink).toContain(
			'https://forvoyez.lemonsqueezy.com/billing'
		)

		// Verify the presence of "Refill your credits" buttons
		log('Verifying presence of "Refill your credits" buttons')
		const refillButton = page
			.locator('a:has-text("Refill your credits")')
			.first()
		await expect(refillButton).toBeVisible()

		// Verify the refill links are present and correct
		log('Verifying the refill links are present and correct')
		const refillLink = await refillButton.getAttribute('href')
		expect(refillLink).toContain('https://forvoyez.lemonsqueezy.com/checkout')
	})
})
