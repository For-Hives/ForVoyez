const { expect, test } = require('@playwright/test')
const { signIn } = require('../../tests-utils')
require('dotenv').config()

let NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

test.describe('Usage Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await signIn(
			page,
			`${NEXT_PUBLIC_URL}/app/usage`,
			NEXT_PUBLIC_URL,
			TEST_EMAIL,
			TEST_PASSWORD
		)
	})

	test('Check usage data and display logic', async ({ page }) => {
		log('Page loaded')

		// Check the presence of the loading skeleton
		const skeletonLoader = page.locator('[data-testid="skeleton-loader"]')
		log('Checking presence of loading skeleton')
		await expect(skeletonLoader).toBeVisible()

		// Wait for the data to be loaded or the no data message to be displayed
		log('Waiting for usage data or no data message to be displayed')
		const noDataMessage = page.locator('[data-testid="no-usage-data"]')
		const usageChart = page.locator('[data-testid="usage-chart"]')
		const usageByTokenChart = page.locator(
			'[data-testid="usage-by-token-chart"]'
		)

		await Promise.race([
			expect(noDataMessage).toBeVisible(),
			expect(usageChart).toBeVisible(),
			expect(usageByTokenChart).toBeVisible(),
		])

		// Verify the presence of tooltip if no data is available
		if (await noDataMessage.isVisible()) {
			log('No usage data available, checking for tooltip')
			const tooltipLocator = page.locator('[data-testid="usage-tooltip"]')
			await expect(tooltipLocator).toBeVisible()
			const tooltipText = await tooltipLocator.innerText()
			expect(tooltipText).toContain('Usage Data')
			expect(tooltipText).toContain(
				'You need to have used the application at least once to see the usage data.'
			)
		}

		// Verify charts if data is available
		if (
			(await usageChart.isVisible()) &&
			(await usageByTokenChart.isVisible())
		) {
			log('Usage data available, verifying charts')

			const areaChart = page.locator('text=Credits Left')
			const barChart = page.locator('text=Used Tokens')

			await expect(areaChart).toBeVisible()
			await expect(barChart).toBeVisible()
		}
	})
})
