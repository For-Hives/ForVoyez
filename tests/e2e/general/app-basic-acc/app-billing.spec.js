const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')

test.describe('Billing Page Functionality', () => {
	test.beforeEach('redirect to billing', async ({ page }) => {
		await page.goto('/app/billing')
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
