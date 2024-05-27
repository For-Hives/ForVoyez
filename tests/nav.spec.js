const { expect, test } = require('@playwright/test')

test('Navbar renders correctly and buttons redirect as expected', async ({
	page,
}) => {
	await page.goto('/')

	// Wait for the page to load completely
	await page.waitForLoadState('load')

	// Debugging step: Capture a screenshot and log page content if the logo is not found
	try {
		await page.waitForSelector('nav img[alt="ForVoyez Logo"]', {
			timeout: 20000,
		}) // Increased timeout
	} catch (error) {
		console.error('Logo element not found:', error)
		await page.screenshot({ path: 'error-screenshot.png' })
		const pageContent = await page.content()
		console.error('Page content:', pageContent)
		throw error
	}

	// Test if the logo is visible and links to the home page
	const logo = await page.locator('nav img[alt="ForVoyez Logo"]')
	await expect(logo).toBeVisible()
	await expect(logo).toHaveAttribute('src', '/logo/logo.webp')
	await logo.click()
	await expect(page).toHaveURL('/')

	// Test if the navigation menu items are present, have the correct URLs, and redirect correctly
	const navItems = await page.locator('nav a')
	const expectedNavItems = [
		{ name: 'Home', href: '/' },
		{ href: '/#features', name: 'Features' },
		{ href: '/#pricing', name: 'Pricing' },
		{ href: 'https://doc.forvoyez.com/', name: 'Documentation' },
		{ href: '/contact', name: 'Contact' },
	]

	await expect(navItems).toHaveCount(expectedNavItems.length)

	for (const [index, item] of expectedNavItems.entries()) {
		await expect(navItems.nth(index)).toHaveText(item.name)
		await expect(navItems.nth(index)).toHaveAttribute('href', item.href)

		// Click on the navigation item and check if it redirects to the correct page
		await navItems.nth(index).click()

		if (item.href.startsWith('/')) {
			await expect(page).toHaveURL(item.href)
		} else {
			// For external links, check if a new tab is opened with the correct URL
			const [newPage] = await Promise.all([
				page.waitForEvent('popup'),
				navItems.nth(index).click(),
			])
			await expect(newPage).toHaveURL(item.href)
			await newPage.close()
		}

		// Go back to the home page for the next iteration
		await page.goto('/')
	}

	// Test if the sign-in button is visible for signed-out users and links to the correct page
	const signInButton = await page.locator('nav a[href="/sign-in"]')
	await expect(signInButton).toBeVisible()
	await signInButton.click()
	await expect(page).toHaveURL('/sign-in')

	// Go back to the home page
	await page.goto('/')

	// Test if the user profile and "Go to dashboard" links are visible for signed-in users
	// (You may need to sign in programmatically before running this test)
	const userProfileLink = await page.locator('nav a[href="/profile"]')
	const dashboardLink = await page.locator('nav a[href="/app"]')
	await expect(userProfileLink).toBeVisible()
	await expect(dashboardLink).toBeVisible()

	// Test if the mobile menu opens and closes when clicking the hamburger icon
	const mobileMenuButton = await page.locator(
		'nav button[aria-label="Toggle navigation"]'
	)
	await mobileMenuButton.click()
	const mobileMenu = await page.locator('nav div[role="dialog"]')
	await expect(mobileMenu).toBeVisible()

	const closeMenuButton = await page.locator(
		'nav button[aria-label="Close menu"]'
	)
	await closeMenuButton.click()
	await expect(mobileMenu).not.toBeVisible()
})
