const { expect, test } = require('@playwright/test')
const { signIn, log } = require('../../tests-utils')
require('dotenv').config()

let NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

test.describe('Billing Page Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await signIn(page, NEXT_PUBLIC_URL, TEST_EMAIL, TEST_PASSWORD)
	})

	test('Check billing page access and Toastify message', async ({ page }) => {
		log('Page loaded')

		// Wait for the loading message
		const loadingMessage = page.locator('text=Loading your data...')
		log('Waiting for loading message to be visible')
		await expect(loadingMessage).toBeVisible()

		// Wait for the Toastify message
		const toastMessage = page.locator('.Toastify__toast-body')
		log('Waiting for Toastify message to be visible')
		await toastMessage.waitFor({ state: 'visible', timeout: 15000 })

		// Verify the Toastify message
		log('Verifying the Toastify message')
		await expect(toastMessage).toHaveText(
			'You must have been subscribed at least once to access this page.'
		)

		log('Billing page access test completed successfully')
	})
})
