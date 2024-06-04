const { expect, test } = require('@playwright/test')
const { getNextPublicUrl, log } = require('../../tests-utils')

// Load environment variables
require('dotenv').config()

const NEXT_PUBLIC_URL = getNextPublicUrl()

test.describe('CTA Component', () => {
	test('CTA section loads correctly', async ({ page }) => {
		await page.goto(NEXT_PUBLIC_URL)

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
		await page.goto(NEXT_PUBLIC_URL)

		log('Page loaded')

		// Check the visibility and functionality of the "Generate Metadata Now" link
		const generateLink = page.locator('[data-testid="cta-generate-link"]')
		log('Checking presence of "Generate Metadata Now" link')
		await expect(generateLink).toBeVisible()
		await expect(generateLink).toHaveAttribute('href', '/app')

		log('Clicking "Generate Metadata Now" link')
		await generateLink.click()

		// Check if redirected to the sign-in page
		await expect(page).toHaveURL(
			new RegExp(`${NEXT_PUBLIC_URL}/sign-in\\?redirect_url=.*%2Fapp`)
		)

		// Optionally, you can add steps to sign in here if needed

		// Go back to the home page
		await page.goto(NEXT_PUBLIC_URL)

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
