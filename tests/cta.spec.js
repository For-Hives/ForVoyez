const { expect, test } = require('@playwright/test')

const log = message => {
	console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
}

test.describe('CTA Component', () => {
	test('CTA section loads correctly', async ({ page }) => {
		await page.goto('/')

		log('Page loaded')

		// Check the visibility of the CTA section
		const ctaSection = page.locator('[data-testid="cta-section"]')
		log('Checking visibility of CTA section')
		await expect(ctaSection).toBeVisible()

		// Check the title and description of the CTA section
		const ctaTitle = ctaSection.locator('[data-testid="cta-title"]')
		log('Checking CTA section title')
		await expect(ctaTitle).toBeVisible()
		await expect(ctaTitle).toHaveText(
			'Boost your SEO with AI-powered image metadata.\nStart optimizing your images today!'
		)

		const ctaDescription = ctaSection.locator('[data-testid="cta-description"]')
		log('Checking CTA section description')
		await expect(ctaDescription).toBeVisible()
		await expect(ctaDescription).toHaveText(
			'Automatically generate SEO-friendly alt texts, titles, and captions for your images. Save time and improve your search engine rankings with our easy-to-use API.'
		)
	})

	test('CTA links are present and functional', async ({ page }) => {
		await page.goto('/')

		log('Page loaded')

		// Check the visibility and functionality of the "Generate Metadata Now" link
		const generateLink = page.locator('[data-testid="cta-generate-link"]')
		log('Checking presence of "Generate Metadata Now" link')
		await expect(generateLink).toBeVisible()
		await expect(generateLink).toHaveAttribute('href', '/app')

		log('Clicking "Generate Metadata Now" link')
		await generateLink.click()
		await expect(page).toHaveURL('/app')

		// Go back to the home page
		await page.goto('/')

		// Check the visibility and functionality of the "Learn more" link
		const learnMoreLink = page.locator('[data-testid="cta-learn-more-link"]')
		log('Checking presence of "Learn more" link')
		await expect(learnMoreLink).toBeVisible()
		await expect(learnMoreLink).toHaveAttribute(
			'href',
			'https://doc.forvoyez.com/'
		)
	})
})
