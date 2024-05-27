const { expect, test } = require('@playwright/test')
require('dotenv').config()

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

const log = message => {
	console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
}

test.describe('Sign-in Functionality', () => {
	test('User can sign in successfully and access manage account', async ({
		page,
	}) => {
		await page.goto(NEXT_PUBLIC_URL)

		log('Page loaded')

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

		// Click the user button to open the profile dialog
		log('Clicking user button to open profile dialog')
		await userButton.click()

		// Check the user profile details in the dialog
		const userProfileDialog = page.locator('.cl-userButtonPopoverCard')
		log('Checking user profile dialog')
		await expect(userProfileDialog).toBeVisible()

		const userName = userProfileDialog.locator('.cl-userPreviewMainIdentifier')
		const userEmail = userProfileDialog.locator(
			'.cl-userPreviewSecondaryIdentifier'
		)

		log('Checking user name in profile dialog')
		await expect(userName).toHaveText('Test Test')

		log('Checking user email in profile dialog')
		await expect(userEmail).toHaveText(TEST_EMAIL)

		// Check the "Manage account" button and click it
		const manageAccountButton = userProfileDialog.locator(
			'.cl-userButtonPopoverActionButton__manageAccount'
		)
		log('Checking presence of "Manage account" button')
		await expect(manageAccountButton).toBeVisible()

		log('Clicking "Manage account" button')
		await manageAccountButton.click()

		// Check if redirected to the manage account page
		log('Checking if redirected to the manage account page')

		// Check for the presence of the email address on the manage account page
		const emailElement = page.locator(
			'.cl-profileSectionItem__emailAddresses .cl-internal-bolkfx'
		)
		log('Checking presence of email address on manage account page')
		await expect(emailElement).toHaveText(TEST_EMAIL)

		log('Sign-in and manage account test completed successfully')
	})
})
