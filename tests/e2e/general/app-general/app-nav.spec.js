const { expect, test } = require('@playwright/test')
const { getNextPublicUrl, signIn, log } = require('../../tests-helpers')
require('dotenv').config()

const NEXT_PUBLIC_URL = getNextPublicUrl()
// use sub to get access to every pages
const TEST_EMAIL = process.env.TEST_EMAIL_SUB
const TEST_PASSWORD = process.env.TEST_PASSWORD_SUB

test.describe('Sidebar Navigation Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await signIn(page, `app`, NEXT_PUBLIC_URL, TEST_EMAIL, TEST_PASSWORD)
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