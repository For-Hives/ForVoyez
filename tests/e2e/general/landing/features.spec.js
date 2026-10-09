const { forEachInSequence } = require('../../../../src/helpers/forEachInSequence.js')
const { expect, test } = require('@playwright/test')
const { getNextPublicUrl, log } = require('../../tests-helpers')

test('FeatureComponent elements are present and correct', async ({ page }) => {
	await page.goto(getNextPublicUrl())

	log('Page loaded')

	// Check the visibility of the features section
	const featuresSection = page.locator('#features')
	log('Checking visibility of features section')
	await expect(featuresSection).toBeVisible()

	// Define the expected features
	const expectedFeatures = [
		{
			name: 'Write image descriptions for you',
			description:
				'Generate alt text, titles, and captions for your WordPress images, instead of filling in every field by hand.',
		},
		{
			name: 'Work inside WordPress',
			description:
				'Install the plugin, connect your ForVoyez account, and manage image descriptions from your familiar WordPress dashboard.',
		},
		{
			name: 'Give search engines useful context',
			description:
				'Add descriptive text that helps search engines understand what your images show, alongside the rest of your SEO work.',
		},
		{
			name: 'Catch up on your media library',
			description:
				'Select existing images and generate their descriptions in bulk. Tackle the images you have been putting off, without opening each one.',
		},
		{
			name: 'Help visitors understand your images',
			description:
				'Alt text describes images for people using screen readers. Review the generated text so it fits the image and its purpose on your page.',
		},
		{
			name: 'Spend more time on your content',
			description:
				'Enable automatic generation for new uploads, so image descriptions become part of your publishing routine.',
		},
	]

	await forEachInSequence(expectedFeatures, async feature => {
		log(`Testing feature: ${feature.name}`)
		const featureElement = page.locator(`text=${feature.name}`)
		await expect(featureElement).toBeVisible()
		await expect(featureElement).toHaveText(feature.name)

		const descriptionElement = featuresSection.getByText(feature.description, { exact: true })
		await expect(descriptionElement).toBeVisible()
		await expect(descriptionElement).toHaveText(feature.description)
	})

	log('Test for presence and correctness of features completed')
})

test('FeatureComponent Rive animation is present', async ({ page }) => {
	await page.goto('/')

	log('Page loaded')

	// Check the visibility of the Rive animation
	const riveComponent = page.locator('[data-testid="rive-component"]')
	log('Checking visibility of Rive animation')
	await expect(riveComponent).toBeVisible()

	log('Test for Rive animation presence completed')
})
