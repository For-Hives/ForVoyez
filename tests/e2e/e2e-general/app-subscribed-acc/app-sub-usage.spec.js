const { expect, test } = require('@playwright/test')
const { getNextPublicUrl, signIn, log } = require('../../tests-utils')
require('dotenv').config()

const NEXT_PUBLIC_URL = getNextPublicUrl()
const TEST_EMAIL_SUB = process.env.TEST_EMAIL_SUB
const TEST_PASSWORD_SUB = process.env.TEST_PASSWORD_SUB

test.describe('Usage Chart Functionality for Subscribed User', () => {
	test.beforeEach(async ({ page }) => {
		await signIn(
			page,
			`app/usage`,
			NEXT_PUBLIC_URL,
			TEST_EMAIL_SUB,
			TEST_PASSWORD_SUB
		)
	})

	test('Usage chart should display data for subscribed user', async ({
		page,
	}) => {
		log('Page loaded')

		// Check if usage data exists
		const noUsageData = page.locator('[data-testid="no-usage-data"]')
		const usageTooltip = page.locator('[data-testid="usage-tooltip"]')
		const usageChartContainer = page.locator(
			'[data-testid="usage-chart-container"]'
		)

		log('Usage data found')
		await expect(usageTooltip).toBeHidden()
		await expect(usageChartContainer).toContainText('Credits Left')
	})

	test('Usage by token chart should display data for subscribed user', async ({
		page,
	}) => {
		log('Page loaded')

		// Check if usage by token data exists
		const noUsageByTokenData = page.locator(
			'[data-testid="no-usage-by-token-data"]'
		)
		const usageByTokenChartContainer = page.locator(
			'[data-testid="usage-by-token-chart-container"]'
		)

		if (await noUsageByTokenData.isVisible()) {
			log('No usage by token data found')
			await expect(usageByTokenChartContainer).toContainText(
				'No usage data available by token.'
			)
		} else {
			log('Usage by token data found')
			await expect(usageByTokenChartContainer).toContainText('Used Tokens')
		}
	})
})
