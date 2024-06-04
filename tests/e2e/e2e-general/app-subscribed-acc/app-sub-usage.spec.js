const { expect, test } = require('@playwright/test')
require('dotenv').config()

let NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
const TEST_EMAIL_SUB = process.env.TEST_EMAIL_SUB
const TEST_PASSWORD_SUB = process.env.TEST_PASSWORD_SUB

const log = message => {
	console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
}

test.describe('Usage Chart Functionality for Subscribed User', () => {
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

		// Fill in the sign-in form for subscribed user
		log('Filling in sign-in form for subscribed user')
		await emailInput.fill(TEST_EMAIL_SUB)

		const continueButton = page.locator('button:has-text("Continue")')
		log('Waiting for continue button to be visible')
		await continueButton.waitFor({ state: 'visible', timeout: 15000 })
		await continueButton.click()

		// Wait for the password input to be visible
		const passwordInput = page.locator('input[type="password"]')
		log('Waiting for password input to be visible')
		await passwordInput.waitFor({ state: 'visible', timeout: 15000 })
		await passwordInput.fill(TEST_PASSWORD_SUB)

		// Click the continue button
		log('Clicking "Continue" button')
		await continueButton.click()

		// Wait for the user button to be visible after sign-in
		const userButton = page.locator('.cl-userButtonTrigger')
		log('Waiting for user button to be visible after sign-in')
		await userButton.waitFor({ state: 'visible', timeout: 15000 })

		// Navigate to the playground page
		log('Navigating to the usage page')
		await page.goto(`${NEXT_PUBLIC_URL}/app/usage`)
	})

	test('Usage chart should display data for subscribed user', async ({
		page,
	}) => {
		log('Page loaded')

		// Check if usage data exists
		const noUsageData = page.locator('[data-testid="no-usage-data"]')
		const usageTooltip = page.locator('[data-testid="usage-tooltip"]')
		const usageChartContainer = page.locator(
			'[data-testid="usage-chart-container"]'
		)

		log('Usage data found')
		await expect(usageTooltip).toBeHidden()
		await expect(usageChartContainer).toContainText('Credits Left')
	})

	test('Usage by token chart should display data for subscribed user', async ({
		page,
	}) => {
		log('Page loaded')

		// Check if usage by token data exists
		const noUsageByTokenData = page.locator(
			'[data-testid="no-usage-by-token-data"]'
		)
		const usageByTokenChartContainer = page.locator(
			'[data-testid="usage-by-token-chart-container"]'
		)

		if (await noUsageByTokenData.isVisible()) {
			log('No usage by token data found')
			await expect(usageByTokenChartContainer).toContainText(
				'No usage data available by token.'
			)
		} else {
			log('Usage by token data found')
			await expect(usageByTokenChartContainer).toContainText('Used Tokens')
		}
	})
})
