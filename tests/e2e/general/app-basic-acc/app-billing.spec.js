const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')

test.describe('Billing Page Functionality', () => {
	test.beforeEach('redirect to billing', async ({ page }) => {
		await page.goto('/app/billing')
	})

	test('Check billing page access and Toastify message', async ({ page }) => {
		log('Page loaded')

		// Wait for toast with specific text
		const toastMessage = page.locator(
			'.Toastify__toast-body:has-text("You must have been subscribed at least once")'
		)
		await toastMessage.waitFor({ state: 'visible', timeout: 20000 })

		// Verify message content
		log('Verifying Toast message')
		await expect(toastMessage).toContainText(
			'You must have been subscribed at least once to access this page.'
		)

		log('Test completed successfully')
	})
})
