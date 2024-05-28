const { expect, test } = require('@playwright/test')
require('dotenv').config()

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

const log = message => {
	console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
}

test.describe('Dashboard Quick Links Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(NEXT_PUBLIC_URL)

		// Click on the sign-in button
		const signInButton = page.locator('[data-testid="sign-in-button"]')
		log('Checking presence of "Sign in" button')
		await expect(signInButton).toBeVisible()

		log('Clicking "Sign in" button')
		await signInButton.click()

		// Wait for the email input to be visible
		const emailInput = page.locator('input[name="identifier"]')
		log('Waiting for email input to be visible')
		await emailInput.waitFor({ state: 'visible', timeout: 15000 })

		// Fill in the sign-in form
		log('Filling in sign-in form')
		await emailInput.fill(TEST_EMAIL)

		const continueButton = page.locator('button:has-text("Continue")')
		log('Waiting for continue button to be visible')
		await continueButton.waitFor({ state: 'visible', timeout: 15000 })
		await continueButton.click()

		// Wait for the password input to be visible
		const passwordInput = page.locator('input[type="password"]')
		log('Waiting for password input to be visible')
		await passwordInput.waitFor({ state: 'visible', timeout: 15000 })
		await passwordInput.fill(TEST_PASSWORD)

		// Click the continue button
		log('Clicking "Continue" button')
		await continueButton.click()

		// Wait for the user button to be visible after sign-in
		const userButton = page.locator('.cl-userButtonTrigger')
		log('Waiting for user button to be visible after sign-in')
		await userButton.waitFor({ state: 'visible', timeout: 15000 })

		// Navigate to the dashboard
		log('Navigating to the dashboard')
		await page.goto(`${NEXT_PUBLIC_URL}/app`)
	})

	test('Dashboard quick links navigate correctly', async ({ page }) => {
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
			const linkLocator = page.locator(`[data-testid="${link.testId}"]`)
			await expect(linkLocator).toBeVisible()

			log(`Clicking quick link: ${link.name}`)
			const [newPage] = await Promise.all([
				link.href.startsWith('http')
					? page.waitForEvent('popup')
					: page.waitForNavigation(),
				linkLocator.click(),
			])

			if (link.href.startsWith('http')) {
				await expect(newPage).toHaveURL(link.href)
				await newPage.close()
			} else {
				await expect(page).toHaveURL(`${NEXT_PUBLIC_URL}${link.href}`)
				await page.goto(`${NEXT_PUBLIC_URL}/app`)
			}
		}

		log('Dashboard quick links navigation test completed successfully')
	})
})
