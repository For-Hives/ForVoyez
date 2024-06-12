import { expect } from '@playwright/test'

export const getNextPublicUrl = () => {
	let NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

	if (
		!NEXT_PUBLIC_URL.startsWith('http://') &&
		!NEXT_PUBLIC_URL.startsWith('https://')
	) {
		NEXT_PUBLIC_URL = `http://${NEXT_PUBLIC_URL}`
	}
	return NEXT_PUBLIC_URL
}

export const log = message => {
	const ENABLE_TEST_LOGS = process.env.ENABLE_TEST_LOGS === 'true'
	if (ENABLE_TEST_LOGS) {
		console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
	}
}

export const signIn = async (
	page,
	NEXT_PUBLIC_URL,
	TEST_EMAIL,
	TEST_PASSWORD
) => {
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
}
