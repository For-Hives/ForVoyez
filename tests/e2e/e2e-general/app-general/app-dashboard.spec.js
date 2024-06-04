const { expect, test } = require('@playwright/test')
const { getNextPublicUrl, signIn, log } = require('../../tests-utils')
require('dotenv').config()

const NEXT_PUBLIC_URL = getNextPublicUrl()
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

test.describe('Dashboard Quick Links Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await signIn(
			page,
			`app/dashboard`,
			NEXT_PUBLIC_URL,
			TEST_EMAIL,
			TEST_PASSWORD
		)
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

	test('Dashboard internal quick links navigate correctly', async ({
		page,
	}) => {
		log('Page loaded')

		const internalQuickLinks = [
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

		for (const link of internalQuickLinks) {
			log(`Checking internal quick link: ${link.name}`)
			const linkLocator = page.locator(`[data-testid="${link.testId}"] a`) // Targeting the <a> element
			await expect(linkLocator).toBeVisible()

			log(`Clicking internal quick link: ${link.name}`)
			await Promise.all([page.waitForNavigation(), linkLocator.click()])
			await expect(page).toHaveURL(`${NEXT_PUBLIC_URL}${link.href}`)

			// Go back to the dashboard for the next iteration
			await page.goto(`${NEXT_PUBLIC_URL}/app`)
		}

		log('Dashboard internal quick links navigation test completed successfully')
	})

	test('Dashboard external quick links have correct href', async ({ page }) => {
		log('Page loaded')

		const externalQuickLinks = [
			{
				href: 'https://doc.forvoyez.com/',
				testId: 'link-documentation',
				name: 'Documentation',
			},
		]

		for (const link of externalQuickLinks) {
			log(`Checking external quick link: ${link.name}`)
			const linkLocator = page.locator(`[data-testid="${link.testId}"] a`) // Targeting the <a> element
			await expect(linkLocator).toBeVisible()

			log(`Checking href of external quick link: ${link.name}`)
			await expect(linkLocator).toHaveAttribute('href', link.href)
		}

		log('Dashboard external quick links href test completed successfully')
	})
})
