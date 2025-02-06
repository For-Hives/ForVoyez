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
		await expect(ctaTitle).toContainText(
			'Boost your SEO with AI-powered image metadata.'
		)
		await expect(ctaTitle).toContainText('Start optimizing your images today!')

		const ctaDescription = ctaSection.locator('[data-testid="cta-description"]')
		log('Checking CTA section description')
		await expect(ctaDescription).toBeVisible()
		await expect(ctaDescription).toContainText(
			'Automatically generate SEO-friendly alt texts, titles, and captions for your images. Save time and improve your search engine rankings with our easy-to-use API.'
		)
	})

	test('CTA links are present and functional', async ({ page }) => {
		await page.goto(getNextPublicUrl())
		log('Page loaded')

		// Generate Metadata link
		const generateLink = page.locator('[data-testid="cta-generate-link"]')
		await expect(generateLink).toBeVisible()

		log('Clicking generate link')
		await generateLink.click()

		// Verify URL with proper regex
		await expect(page).toHaveURL(
			new RegExp(`${getNextPublicUrl()}/sign-in\\?redirect_url=.*%2Fapp`),
			{ timeout: 10000 }
		)

		// Navigate back
		await page.goBack()

		// Learn More link
		const learnMoreLink = page.locator('[data-testid="cta-learn-more-link"]')
		await expect(learnMoreLink).toHaveAttribute(
			'href',
			'https://doc.forvoyez.com/'
		)
	})
})
