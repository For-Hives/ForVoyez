const { expect, test } = require('../auth/fixtures')

test('authenticated test', async ({ page }) => {
	// The page is already authenticated.
	await page.goto('/dashboard')
	await expect(page).toHaveURL('/dashboard')
})
