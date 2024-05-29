const { expect, test } = require('@playwright/test')
require('dotenv').config()

let NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

const log = message => {
	console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
}

test.describe('Plans Management Functionality', () => {
	test.beforeEach(async ({ page }) => {
		// Ensure the URL starts with http:// or https://
		if (
			!NEXT_PUBLIC_URL.startsWith('http://') &&
			!NEXT_PUBLIC_URL.startsWith('https://')
		) {
			NEXT_PUBLIC_URL = `http://${NEXT_PUBLIC_URL}`
		}
		await page.goto(NEXT_PUBLIC_URL)

		// Click on the sign-in button
		const signInButton = page.locator('[data-testid="sign-in-button"]')
		log('Checking presence of "Sign in" button')
		await expect(signInButton).toBeVisible()

		log('Clicking "Sign in" button')
		await signInButton.click()

		// Wait for the email input to be visible
		const emailInput = page.locator('input[name="identifier"]')
		log('Waiting for email input to be visible')
		await emailInput.waitFor({ state: 'visible', timeout: 15000 })

		// Fill in the sign-in form
		log('Filling in sign-in form')
		await emailInput.fill(TEST_EMAIL)

		const continueButton = page.locator('button:has-text("Continue")')
		log('Waiting for continue button to be visible')
		await continueButton.waitFor({ state: 'visible', timeout: 15000 })
		await continueButton.click()

		// Wait for the password input to be visible
		const passwordInput = page.locator('input[type="password"]')
		log('Waiting for password input to be visible')
		await passwordInput.waitFor({ state: 'visible', timeout: 15000 })
		await passwordInput.fill(TEST_PASSWORD)

		// Click the continue button
		log('Clicking "Continue" button')
		await continueButton.click()

		// Wait for the user button to be visible after sign-in
		const userButton = page.locator('.cl-userButtonTrigger')
		log('Waiting for user button to be visible after sign-in')
		await userButton.waitFor({ state: 'visible', timeout: 15000 })

		// Navigate to the plans page
		log('Navigating to the plans page')
		await page.goto(`${NEXT_PUBLIC_URL}/app/plans`)
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
