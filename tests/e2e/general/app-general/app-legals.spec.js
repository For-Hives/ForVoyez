const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')
require('dotenv').config()

test.describe('Legal Section Navigation Functionality', () => {
	test.beforeEach('redirect to legals', async ({ page }) => {
		await page.goto('/app/legals')
		await expect(page).toHaveURL('/app/legals')
	})

	test('Legal links are present and correct', async ({ page }) => {
		log('Page loaded')

		const legalLinks = [
			{
				href: '/app/legals/legal-notice',
				testId: 'link-legal-notice',
				name: 'Legal Notice',
			},
			{
				href: '/app/legals/privacy-policy',
				testId: 'link-privacy-policy',
				name: 'Privacy Policy',
			},
			{
				testId: 'link-terms-of-service',
				href: '/app/legals/terms',
				name: 'Terms of Service',
			},
		]

		for (const link of legalLinks) {
			log(`Checking legal link: ${link.name}`)
			const linkLocator = page.locator(`[data-testid="${link.testId}"] a`)
			await expect(linkLocator).toBeVisible()
			await expect(linkLocator).toHaveAttribute('href', link.href)
		}

		log('Legal links presence and attributes test completed successfully')
	})

	test('Legal internal links navigate correctly', async ({ page }) => {
		log('Page loaded')

		const legalLinks = [
			{
				href: '/app/legals/legal-notice',
				testId: 'link-legal-notice',
				name: 'Legal Notice',
			},
			{
				href: '/app/legals/privacy-policy',
				testId: 'link-privacy-policy',
				name: 'Privacy Policy',
			},
			{
				testId: 'link-terms-of-service',
				href: '/app/legals/terms',
				name: 'Terms of Service',
			},
		]

		for (const link of legalLinks) {
			log(`Checking legal link: ${link.name}`)
			const linkLocator = page.locator(`[data-testid="${link.testId}"] a`)
			await expect(linkLocator).toBeVisible()

			log(`Clicking legal link: ${link.name}`)
			await Promise.all([page.waitForNavigation(), linkLocator.click()])
			await expect(page).toHaveURL(`${NEXT_PUBLIC_URL}${link.href}`)

			// Go back to the legal page for the next iteration
			await page.goto(`${NEXT_PUBLIC_URL}/app/legals`)
		}

		log('Legal internal links navigation test completed successfully')
	})
})
