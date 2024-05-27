const { expect, test } = require('@playwright/test')
require('dotenv').config()

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

const log = message => {
	console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
}

test.describe('Sign-in Functionality', () => {
	test('User can sign in successfully', async ({ page }) => {
		await page.goto(NEXT_PUBLIC_URL)

		log('Page loaded')

		// Click on the sign-in button
		const signInButton = page.locator('[data-testid="sign-in-button"]')
		log('Checking presence of "Sign in" button')
		await expect(signInButton).toBeVisible()

		log('Clicking "Sign in" button')
		await signInButton.click()

		// Wait for the email input to be visible
		const emailInput = page.locator('#identifier-field')
		log('Waiting for email input to be visible')
		await emailInput.waitFor({ state: 'visible', timeout: 15000 })

		// Fill in the sign-in form
		log('Filling in sign-in form')
		await emailInput.fill(TEST_EMAIL)

		const passwordInput = page.locator('input[type="password"]')
		log('Waiting for password input to be visible')
		await passwordInput.waitFor({ state: 'visible', timeout: 15000 })
		await passwordInput.fill(TEST_PASSWORD)

		const submitButton = page.locator('button:has-text("Continue")')
		log('Waiting for submit button to be visible')
		await submitButton.waitFor({ state: 'visible', timeout: 15000 })
		await submitButton.click()

		// Wait for the user button to be visible after sign-in
		const userButton = page.locator('.cl-userButton-root button')
		log('Waiting for user button to be visible after sign-in')
		await userButton.waitFor({ state: 'visible', timeout: 15000 })

		// Check if redirected to the dashboard
		const dashboardLink = page.locator('[data-testid="dashboard-link"]')
		log('Checking if redirected to the dashboard')
		await expect(dashboardLink).toBeVisible()

		// Ensure the URL is correct
		await expect(page).toHaveURL(`${NEXT_PUBLIC_URL}/app`)

		log('Sign-in test completed successfully')
	})
})
