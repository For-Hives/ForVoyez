const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')

const NOT_SUBSCRIBED_MESSAGE = 'You must have been subscribed at least once to access this page.'

test.describe('Billing Page Functionality', () => {
	test.beforeEach('redirect to billing', async ({ page }) => {
		await page.goto('/app/billing')
	})

	test('Check billing page access and Toastify message', async ({ page }) => {
		log('Page loaded')

		// The basic test account never bought anything: no Lemon Squeezy
		// customer portal, so the page explains why and sends the user to the
		// plans. Match the toast by role and text, not by react-toastify's
		// inner markup (v11 dropped the `.Toastify__toast-body` wrapper).
		const toastMessage = page.getByRole('alert').filter({ hasText: NOT_SUBSCRIBED_MESSAGE })
		await toastMessage.waitFor({ state: 'visible', timeout: 20000 })

		// Verify message content
		log('Verifying Toast message')
		await expect(toastMessage).toContainText(NOT_SUBSCRIBED_MESSAGE)

		log('Verifying redirect to the plans page')
		await expect(page).toHaveURL(/\/app\/plans/)

		log('Test completed successfully')
	})
})
