const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')

// The paid analysis itself is in app-sub-credits.spec.js.
test.describe('Playground Functionality for Subscribed User', () => {
	test.beforeEach('redirect to playground', async ({ page }) => {
		await page.goto('/app/playground')
		await expect(page).toHaveURL('/app/playground')
	})

	test('Playground should not display usage tooltip for subscribed user', async ({
		page,
	}) => {
		log('Page loaded')

		// the tooltip depends on the credits, shown once the server action
		// answered (a loading placeholder until then)
		await expect(page.getByTestId('user-credits')).not.toHaveText('0', {
			timeout: 30_000,
		})

		log('Checking absence of the tooltip')
		await expect(page.getByTestId('tooltip')).toBeHidden()

		log('Playground usage tooltip is not displayed for subscribed user')
	})
})
