const { expect, test } = require('../../auth/fixtures')
const { getNextPublicUrl, log } = require('../../tests-helpers')

test.describe('Playground Functionality', () => {
	test.beforeEach('redirect to playground', async ({ page }) => {
		await page.goto('/app/playground')
		await expect(page).toHaveURL('/app/playground')
	})

	test('Check playground usage tooltip and redirection', async ({ page }) => {
		log('Page loaded')

		// Wait for the tooltip to appear
		const tooltipLocator = page.locator('[data-testid="tooltip-link"]')
		log('Checking presence of the tooltip')
		await expect(tooltipLocator).toBeVisible()

		// Verify the text content of the tooltip
		const tooltipText = await tooltipLocator.innerText()
		expect(tooltipText).toContain('Playground usage')
		expect(tooltipText).toContain(
			'You need to have at least 1 credit to use the playground, get a plan before'
		)

		// Click the link and verify redirection
		log('Clicking the link to check redirection')
		await tooltipLocator.click({ force: true })
		await expect(page).toHaveURL(`${getNextPublicUrl()}/app/plans`)

		log('Playground usage tooltip and redirection test completed successfully')
	})
})
