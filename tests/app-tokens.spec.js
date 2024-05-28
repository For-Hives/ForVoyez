const { expect, test } = require('@playwright/test')
require('dotenv').config()

let NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

const log = message => {
	console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
}

test.describe('Token Management Functionality', () => {
	test.beforeEach(async ({ page }) => {
		// ensure the URL starts with http:// or https://
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

		// Navigate to the tokens page
		log('Navigating to the tokens page')
		await page.goto(`${NEXT_PUBLIC_URL}/app/tokens`)
	})

	test('Add and delete tokens', async ({ page }) => {
		log('Page loaded')

		// Adding the first token
		log('Clicking "Add token" button')
		await page.locator('[data-testid="add-token-button"]').click()

		// Fill the token creation form and submit
		log('Filling and submitting token creation form')
		await page.locator('input[name="tokenName"]').fill('Test Token 1')
		await page.locator('button:has-text("Create Token")').click()

		// Adding the second token
		log('Clicking "Add token" button')
		await page.locator('[data-testid="add-token-button"]').click()

		// Fill the token creation form and submit
		log('Filling and submitting token creation form')
		await page.locator('input[name="tokenName"]').fill('Test Token 2')
		await page.locator('button:has-text("Create Token")').click()

		// Verify tokens are added
		log('Verifying tokens are added')
		await expect(page.locator('[data-testid="token-row-0"]')).toBeVisible()
		await expect(page.locator('[data-testid="token-row-1"]')).toBeVisible()

		// Deleting the first token
		log('Clicking "Delete" button for the first token')
		await page.locator('[data-testid="delete-token-button-0"]').click()

		// Confirm deletion
		log('Confirming token deletion')
		await page.locator('button:has-text("Confirm")').click()

		// Verify the first token is deleted
		log('Verifying the first token is deleted')
		await expect(page.locator('[data-testid="token-row-0"]')).not.toBeVisible()
		await expect(page.locator('[data-testid="token-row-1"]')).toBeVisible()

		log('Token management test completed successfully')
	})
})
