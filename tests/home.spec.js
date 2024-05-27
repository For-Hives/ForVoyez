const { expect, test } = require('@playwright/test')

test('Home page loads correctly', async ({ page }) => {
	await page.goto('/')

	// Check if the page title is correct
	const title = await page.title()
	expect(title).toBe('ForVoyez - AI-Powered Image Metadata Generation')

	// Check if the main heading is visible
	const mainHeading = await page.textContent('h1')
	expect(mainHeading).toBe(
		'Generate Image Alt Text and Meta Descriptions in Seconds.'
	)

	// Check if the "Get started" button is present and has the correct href
	const getStartedButton = await page.locator('a[href="/app"]')
	await expect(getStartedButton).toBeVisible()
	await expect(getStartedButton).toHaveText('Get started')

	// Check if the features section is present
	const featuresSection = await page.locator('#features')
	await expect(featuresSection).toBeVisible()

	// Check if the pricing section is present
	const pricingSection = await page.locator('#pricing')
	await expect(pricingSection).toBeVisible()

	// Check if the footer is present
	const footer = await page.locator('footer')
	await expect(footer).toBeVisible()
})
