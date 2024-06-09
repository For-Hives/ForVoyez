const { expect, test } = require('@playwright/test')
const { getNextPublicUrl, signIn, log } = require('../../tests-helpers')
require('dotenv').config()

const NEXT_PUBLIC_URL = getNextPublicUrl()
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

test.describe('Dashboard Quick Links Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await signIn(page, `app/`, NEXT_PUBLIC_URL, TEST_EMAIL, TEST_PASSWORD)
	})

	test('Dashboard quick links are present and correct', async ({ page }) => {
		log('Page loaded')

		const quickLinks = [
			{
				href: 'https://doc.forvoyez.com/',
				testId: 'link-documentation',
				name: 'Documentation',
			},
			{
				testId: 'link-playground',
				href: '/app/playground',
				name: 'Playground',
			},
			{ testId: 'link-api-keys', href: '/app/tokens', name: 'API Keys' },
			{ testId: 'link-usage', href: '/app/usage', name: 'Usage' },
			{ testId: 'link-plans', href: '/app/plans', name: 'Plans' },
			{ name: 'Help, FAQ & Contact', testId: 'link-help', href: '/contact' },
		]

		for (const link of quickLinks) {
			log(`Checking quick link: ${link.name}`)
			const linkLocator = page.locator(`[data-testid="${link.testId}"] a`) // Targeting the <a> element
			await expect(linkLocator).toBeVisible()
			await expect(linkLocator).toHaveAttribute('href', link.href)
		}

		log(
			'Dashboard quick links presence and attributes test completed successfully'
		)
	})
})
