const { expect, test } = require('@playwright/test')
const { getNextPublicUrl, signIn, log } = require('../../tests-utils')
require('dotenv').config()

const NEXT_PUBLIC_URL = getNextPublicUrl()
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

test.describe('Billing Page Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await signIn(
			page,
			`app/billing`,
			NEXT_PUBLIC_URL,
			TEST_EMAIL,
			TEST_PASSWORD
		)
	})

	test('Check billing page access and Toastify message', async ({ page }) => {
		log('Page loaded')

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
