const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')
require('dotenv').config()

test.describe('Playground Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await signIn(
			page,
			`app/playground`,
			NEXT_PUBLIC_URL,
			TEST_EMAIL,
			TEST_PASSWORD
		)
	})

	test('Check playground usage tooltip and redirection', async ({ page }) => {
		log('Page loaded')

		// Wait for the tooltip to appear
		const tooltipLocator = page.locator('[data-testid="tooltip"]')
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
		const tooltipLinkLocator = page.locator('[data-testid="tooltip-link"]')
		await Promise.all([page.waitForNavigation(), tooltipLinkLocator.click()])
		await expect(page).toHaveURL(`${NEXT_PUBLIC_URL}/app/plans`)

		log('Playground usage tooltip and redirection test completed successfully')
	})
})
