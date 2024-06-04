const { expect, test } = require('@playwright/test')

const log = message => {
	console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
}

test('FeatureComponent elements are present and correct', async ({ page }) => {
	await page.goto('/')

	log('Page loaded')

	// Check the visibility of the features section
	const featuresSection = page.locator('#features')
	log('Checking visibility of features section')
	await expect(featuresSection).toBeVisible()

	// Define the expected features
	const expectedFeatures = [
		{
			description:
				'Automatically generate SEO-optimized alt texts, titles, and captions with our AI-powered tool. Save time and focus on what matters most.',
			name: 'Automate Metadata Input',
		},
		{
			description:
				'Our well-documented RESTful API allows for seamless integration with your existing applications and workflows. Start generating optimized image metadata in no time.',
			name: 'Seamless Integration in Minutes',
		},
		{
			description:
				'Gain a competitive edge with our SEO-optimized image metadata. Improve your rankings, drive more organic traffic, and increase user engagement.',
			name: 'Boost Your Search Engine Visibility',
		},
		{
			description:
				'Whether you have dozens, hundreds, or thousands of images, our tool can handle the job. Take advantage of our powerful batch processing to generate metadata for entire image libraries in a flash.',
			name: 'Large-Scale Metadata in a Snap',
		},
		{
			description:
				'By generating accurate alt texts and captions for your images, our tool helps make your content accessible to a wider audience. Improve the experience for all users and show your commitment to digital inclusivity.',
			name: 'Create Accessible Images for Everyone',
		},
		{
			description:
				'By automating image metadata creation, our tool allows you to save valuable time and free up resources. Focus on creating quality content, innovating, and growing your business.',
			name: 'Free Up Your Time for What Really Counts',
		},
	]

	for (const feature of expectedFeatures) {
		log(`Testing feature: ${feature.name}`)
		const featureElement = page.locator(`text=${feature.name}`)
		await expect(featureElement).toBeVisible()
		await expect(featureElement).toHaveText(feature.name)

		const descriptionElement = featureElement
			.locator('..')
			.locator(`text=${feature.description}`)
		await expect(descriptionElement).toBeVisible()
		await expect(descriptionElement).toHaveText(feature.description)
	}

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
