const { expect, test } = require('@playwright/test')
const { getNextPublicUrl, log } = require('../../tests-helpers')

test.describe('CTA Component', () => {
	test('CTA section loads correctly', async ({ page }) => {
		await page.goto(getNextPublicUrl())

		log('Page loaded')

		// Check the visibility of the CTA section
		const ctaSection = page.locator('[data-testid="cta-section"]')
		log('Checking visibility of CTA section')
		await expect(ctaSection).toBeVisible()

		// Check the title and description of the CTA section
		const ctaTitle = ctaSection.locator('[data-testid="cta-title"]')
		log('Checking CTA section title')
		await expect(ctaTitle).toBeVisible()
		await expect(ctaTitle).toContainText('Give your WordPress images a description.')
		await expect(ctaTitle).toContainText('Get back to creating content.')

		const ctaDescription = ctaSection.locator('[data-testid="cta-description"]')
		log('Checking CTA section description')
		await expect(ctaDescription).toBeVisible()
		await expect(ctaDescription).toContainText(
			'Install ForVoyez, connect your account, and generate alt text from your media library. The plugin is free to install; image generation uses the credits in your ForVoyez plan.'
		)
	})

	test('CTA links are present and functional', async ({ page }) => {
		await page.goto(getNextPublicUrl())
		log('Page loaded')

		// Generate Metadata link
		const generateLink = page.locator('[data-testid="cta-generate-link"]')
		await expect(generateLink).toBeVisible()

		await expect(generateLink).toHaveAttribute('href', 'https://wordpress.org/plugins/auto-alt-text-for-images/')

		// Learn More link
		const learnMoreLink = page.locator('[data-testid="cta-learn-more-link"]')
		await expect(learnMoreLink).toHaveAttribute('href', '/wordpress-plugin#how-it-works')
	})
})
