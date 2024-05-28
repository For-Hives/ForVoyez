const { expect, test } = require('@playwright/test')
require('dotenv').config()

let NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

const log = message => {
	console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
}

test.describe('Token Management Functionality', () => {
	test.beforeEach(async ({ context, page }) => {
		// Ensure the URL starts with http:// or https://
		if (
			!NEXT_PUBLIC_URL.startsWith('http://') &&
			!NEXT_PUBLIC_URL.startsWith('https://')
		) {
			NEXT_PUBLIC_URL = `http://${NEXT_PUBLIC_URL}`
		}
		// Grant clipboard permissions
		await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
			origin: NEXT_PUBLIC_URL,
		})
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

	test('Add, copy and delete tokens', async ({ page }) => {
		log('Page loaded')

		// Adding the first token
		log('Clicking "Add token" button')
		await page.locator('[data-testid="add-token-button"]').click()

		// Fill the token creation form and submit
		log('Filling and submitting token creation form')
		await page.locator('input[name="name"]').fill('Test Token 1')
		await page.locator('input[name="expiredAt"]').fill('2034-05-26')
		await page.locator('button:has-text("Create Token")').click()

		// Wait for the token value to appear and copy it
		log('Waiting for token value to appear and copying it')
		const tokenValueLocator = page.locator('input[name="token"]')
		await tokenValueLocator.waitFor({ state: 'visible', timeout: 15000 })
		const tokenValue = await tokenValueLocator.inputValue()

		log('Clicking "Copy" button')
		await page.locator('button:has-text("Copy")').click()

		// Verify the token value is in the clipboard
		log('Verifying the token value is in the clipboard')
		const clipboardText = await page.evaluate(() =>
			navigator.clipboard.readText()
		)
		expect(clipboardText).toBe(tokenValue)

		// Close the modal
		log('Closing the modal')
		await page.locator('button:has-text("Copied it")').click()

		// Adding the second token
		log('Clicking "Add token" button')
		await page.locator('[data-testid="add-token-button"]').click()

		// Fill the token creation form and submit
		log('Filling and submitting token creation form')
		await page.locator('input[name="name"]').fill('Test Token 2')
		await page.locator('input[name="expiredAt"]').fill('2034-05-26')
		await page.locator('button:has-text("Create Token")').click()

		// Close the modal for the second token
		log('Closing the modal for the second token')
		await page.locator('button:has-text("Copied it")').click()

		// Verify tokens are added
		log('Verifying tokens are added')
		await expect(page.locator('[data-testid="token-row-0"]')).toBeVisible()
		await expect(page.locator('[data-testid="token-row-1"]')).toBeVisible()

		// Deleting the first token
		log('Clicking "Delete" button for the first token')
		await page.locator('[data-testid="delete-token-button-0"]').click()

		// Confirm deletion by clicking "Revoke Key"
		log('Clicking "Revoke Key" button')
		await page.locator('button:has-text("Revoke Key")').click()

		// Verify the first token is deleted
		log('Verifying the first token is deleted')
		await expect(page.locator('[data-testid="token-row-0"]')).not.toBeVisible()
		await expect(page.locator('[data-testid="token-row-1"]')).toBeVisible()

		log('Token management test completed successfully')
	})
})
