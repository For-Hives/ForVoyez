const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')

test.describe('Sidebar Navigation Functionality', () => {
	test.beforeEach('redirect to app', async ({ page }) => {
		await page.goto('/app')
		await expect(page).toHaveURL('/app')
	})

	test('Sidebar links are present and correct', async ({ page }) => {
		log('Page loaded')

		const sidebarLinks = [
			{ testId: 'nav-link-home', title: 'Home', href: '/app' },
			{
				href: 'https://doc.forvoyez.com/',
				testId: 'nav-link-documentation',
				title: 'Documentation',
			},
			{
				testId: 'nav-link-playground',
				href: '/app/playground',
				title: 'Playground',
			},
			{ testId: 'nav-link-api-keys', href: '/app/tokens', title: 'API Keys' },
			{ testId: 'nav-link-usage', href: '/app/usage', title: 'Usage' },
			{ testId: 'nav-link-plans', href: '/app/plans', title: 'Plans' },
			{
				title: 'Help, FAQ & Contact',
				testId: 'nav-link-help',
				href: '/contact',
			},
			{
				title: 'Invoice & billing management',
				testId: 'nav-link-billing',
				href: '/app/billing',
			},
			{
				title: 'Legal Information',
				testId: 'nav-link-legals',
				href: '/app/legals',
			},
		]

		for (const link of sidebarLinks) {
			log(`Checking sidebar link: ${link.title}`)
			const linkLocator = page.locator(`[data-testid="${link.testId}"]`) // Targeting the <a> element
			await expect(linkLocator).toBeVisible()
			await expect(linkLocator).toHaveAttribute('href', link.href)
		}

		log('Sidebar links presence and attributes test completed successfully')
	})
})
