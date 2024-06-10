const { expect, test } = require('../../auth/fixtures')
const { log } = require('../../tests-helpers')

test.describe('Playground Functionality for Subscribed User', () => {
	test.beforeEach('redirect to playground', async ({ page }) => {
		await page.goto('/app/playground')
		await expect(page).toHaveURL('/app/playground')
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
		await fileChooser.setFiles('./tests/e2e/resources/1x1.webp')

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
