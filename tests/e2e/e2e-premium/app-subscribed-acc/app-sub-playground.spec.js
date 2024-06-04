const { expect, test } = require('@playwright/test')
require('dotenv').config()

let NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
const TEST_EMAIL_SUB = process.env.TEST_EMAIL_SUB
const TEST_PASSWORD_SUB = process.env.TEST_PASSWORD_SUB

test.describe('Playground Functionality for Subscribed User', () => {
	test.beforeEach(async ({ page }) => {
		// Ensure the URL starts with http:// or https://
		if (
			!NEXT_PUBLIC_URL.startsWith('http://') &&
			!NEXT_PUBLIC_URL.startsWith('https://')
		) {
			NEXT_PUBLIC_URL = `http://${NEXT_PUBLIC_URL}`
		}
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

		// Fill in the sign-in form for subscribed user
		log('Filling in sign-in form for subscribed user')
		await emailInput.fill(TEST_EMAIL_SUB)

		const continueButton = page.locator('button:has-text("Continue")')
		log('Waiting for continue button to be visible')
		await continueButton.waitFor({ state: 'visible', timeout: 15000 })
		await continueButton.click()

		// Wait for the password input to be visible
		const passwordInput = page.locator('input[type="password"]')
		log('Waiting for password input to be visible')
		await passwordInput.waitFor({ state: 'visible', timeout: 15000 })
		await passwordInput.fill(TEST_PASSWORD_SUB)

		// Click the continue button
		log('Clicking "Continue" button')
		await continueButton.click()

		// Wait for the user button to be visible after sign-in
		const userButton = page.locator('.cl-userButtonTrigger')
		log('Waiting for user button to be visible after sign-in')
		await userButton.waitFor({ state: 'visible', timeout: 15000 })

		// Navigate to the playground page
		log('Navigating to the playground page')
		await page.goto(`${NEXT_PUBLIC_URL}/app/playground`)
	})

	test('Playground should not display usage tooltip for subscribed user', async ({
		page,
	}) => {
		log('Page loaded')

		// Check that the tooltip is not visible
		const tooltipLocator = page.locator('[data-testid="tooltip"]')
		log('Checking absence of the tooltip')
		await expect(tooltipLocator).toBeHidden()

		log('Playground usage tooltip is not displayed for subscribed user')
	})

	test('Subscribed user can submit an image for analysis', async ({ page }) => {
		log('Page loaded')

		// Upload an image file
		const imageInput = page.locator('[data-testid="upload-area"]')

		const fileChooserPromise = page.waitForEvent('filechooser')
		await imageInput.click()
		const fileChooser = await fileChooserPromise
		await fileChooser.setFiles('public/1x1.webp')

		// Fill in the context and JSON schema (if needed)
		const contextInput = page.locator('[data-testid="context-input"]')
		await contextInput.fill('Test context')

		// Click the analyze button
		const analyzeButton = page.locator('[data-testid="analyze-button"]')
		await analyzeButton.click()

		// Wait for the API response
		const responseEditor = page.locator('[data-testid="response-editor"]')
		await responseEditor.waitFor({ state: 'visible', timeout: 15000 })

		// Wait for the response text to change
		log('Waiting for the response text to change...')
		try {
			await page.waitForSelector(
				'[data-testid="response-editor"] .view-lines',
				{
					predicate: async viewLines => {
						const text = await viewLines.textContent()
						log(`Current response text: "${text}"`)
						return !text.includes(
							'Waiting for an image to be analyzed... Please upload an image and click the Analyze your image button.'
						)
					},
					timeout: 15000,
				}
			)
			log('Response text changed successfully')
		} catch (error) {
			log('Error waiting for the response text to change:')
			console.error(error)
			throw error
		}

		// Check that the response is displayed and not the initial message
		const responseText = await responseEditor.textContent()
		log(`Final response text: "${responseText}"`)
		expect(responseText).not.toContain(
			'Waiting for an image to be analyzed... Please upload an image and click the Analyze your image button.'
		)
		expect(responseText).toBeTruthy()

		log('Image analysis completed successfully for subscribed user')
	})
})
