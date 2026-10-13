const { forEachInSequence } = require('../../../../src/helpers/forEachInSequence.js')
const { expect, test } = require('@playwright/test')
const { getNextPublicUrl, log } = require('../../tests-helpers')

test.describe('Developers Component', () => {
	test('Developers section loads correctly', async ({ page }) => {
		await page.goto(getNextPublicUrl())

		log('Page loaded')

		// Check the visibility of the developers section
		const developersSection = page.locator('[data-testid="developers-section"]')
		log('Checking visibility of developers section')
		await expect(developersSection).toBeVisible()
		await expect(developersSection).toHaveAttribute('id', 'developers')

		// Check the title and the two columns
		const developersTitle = developersSection.locator('[data-testid="developers-title"]')
		log('Checking developers section title')
		await expect(developersTitle).toHaveText('One alt text engine. Two ways to use it.')

		log('Checking the WordPress and API columns')
		await expect(developersSection.locator('[data-testid="developers-wordpress"] h3')).toHaveText(
			'AI-ready for WordPress'
		)
		await expect(developersSection.locator('[data-testid="developers-api"] h3')).toHaveText('Developer API')

		// Check the request sample: endpoint, key placeholder, language and schema
		const codeSample = developersSection.locator('[data-testid="developers-code-sample"]')
		log('Checking the request sample')
		await expect(codeSample).toBeVisible()
		await expect(codeSample).toContainText("curl -X POST 'https://forvoyez.com/api/describe'")
		await expect(codeSample).toContainText("-H 'Authorization: Bearer YOUR_API_KEY'")
		await expect(codeSample).toContainText("--form-string 'language=fr'")
		await expect(codeSample).toContainText('schema={"alt":"Short alt text","caption":"One-line caption"}')
	})

	test('Developers links are present and functional', async ({ page }) => {
		await page.goto(getNextPublicUrl())
		log('Page loaded')

		const expectedLinks = [
			{ testId: 'developers-plugin-link', name: 'See the WordPress plugin', href: '/wordpress-plugin' },
			{ testId: 'developers-docs-link', name: 'Read the API docs', href: 'https://doc.forvoyez.com/' },
			{ testId: 'developers-api-key-link', name: 'Get your API key', href: '/app/tokens' },
		]

		await forEachInSequence(expectedLinks, async item => {
			log(`Testing developers link: ${item.testId}`)
			const link = page.locator(`[data-testid="${item.testId}"]`)
			await expect(link).toBeVisible()
			await expect(link).toContainText(item.name)
			await expect(link).toHaveAttribute('href', item.href)
		})
	})

	test('Developers section sits between the plugin section and the pricing', async ({ page }) => {
		await page.goto(getNextPublicUrl())
		log('Page loaded')

		const top = locator => locator.evaluate(element => element.getBoundingClientRect().top + window.scrollY)
		const pluginTop = await top(page.getByText('A simpler routine for your WordPress images', { exact: true }))
		const developersTop = await top(page.locator('#developers'))
		const pricingTop = await top(page.locator('#pricing'))

		expect(developersTop).toBeGreaterThan(pluginTop)
		expect(pricingTop).toBeGreaterThan(developersTop)
	})

	test('Developers section fits a phone screen', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 })
		await page.goto(getNextPublicUrl())
		log('Page loaded')

		// The request sample scrolls inside its own box: it must not widen the cards.
		const cards = ['developers-wordpress', 'developers-api']
		await forEachInSequence(cards, async testId => {
			const box = await page.locator(`[data-testid="${testId}"]`).boundingBox()
			expect(box.x).toBeGreaterThanOrEqual(0)
			expect(box.x + box.width).toBeLessThanOrEqual(390)
		})
		const codeSample = page.locator('[data-testid="developers-code-sample"]')
		const codeBox = await codeSample.boundingBox()
		expect(codeBox.x + codeBox.width).toBeLessThanOrEqual(390)
	})
})
