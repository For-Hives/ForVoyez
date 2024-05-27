// tests/home.spec.js
const { test, expect } = require('@playwright/test')

test("Page d'accueil se charge correctement", async ({ page }) => {
	await page.goto('/')
	const title = await page.title()
	expect(title).toBe('ForVoyez - AI-Powered Image Metadata Generation')
})
