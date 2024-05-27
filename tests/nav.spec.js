const { expect, test } = require('@playwright/test')

test('Navbar renders correctly and buttons redirect as expected', async ({
	page,
}) => {
	await page.goto('/')

	// Wait for the logo element to be present
	const logo = page.locator('[data-testid="logo-image"]')
	await expect(logo).toBeVisible()

	// Test if the logo image source is correct
	await expect(logo).toHaveAttribute(
		'src',
		/\/_next\/image\?url=%2Flogo%2Flogo\.webp&.*/
	)

	// Test if the logo link redirects to the home page
	const logoLink = page.locator('[data-testid="logo-link"]')
	await logoLink.click()
	await expect(page).toHaveURL('/')

	// Test if the navigation menu items are present, have the correct URLs, and redirect correctly
	const expectedNavItems = [
		{ testId: 'nav-home', name: 'Home', href: '/' },
		{ testId: 'nav-features', href: '/#features', name: 'Features' },
		{ testId: 'nav-pricing', href: '/#pricing', name: 'Pricing' },
		{
			href: 'https://doc.forvoyez.com/',
			name: 'Documentation',
			testId: 'nav-docs',
		},
		{ testId: 'nav-contact', href: '/contact', name: 'Contact' },
	]

	for (const item of expectedNavItems) {
		const navItem = page.locator(`[data-testid="${item.testId}"]`)
		await expect(navItem).toHaveText(item.name)
		await expect(navItem).toHaveAttribute('href', item.href)

		// Click on the navigation item and check if it redirects to the correct page
		if (item.href.startsWith('/')) {
			await Promise.all([page.waitForNavigation(), navItem.click()])
			await expect(page).toHaveURL(item.href)
		} else {
			// For external links, check if a new tab is opened with the correct URL
			const [newPage] = await Promise.all([
				page.waitForEvent('popup'),
				navItem.click(),
			])
			await newPage.waitForLoadState()
			await expect(newPage).toHaveURL(item.href)
			await newPage.close()
		}

		// Go back to the home page for the next iteration
		await page.goto('/')
	}

	// Test if the sign-in button is visible for signed-out users and links to the correct page
	const signInButton = page.locator('[data-testid="sign-in-button"]')
	await expect(signInButton).toBeVisible()
	await signInButton.click()
	await expect(page).toHaveURL('/sign-in')

	// Go back to the home page
	await page.goto('/')

	// Test if the user profile and "Go to dashboard" links are visible for signed-in users
	// (You may need to sign in programmatically before running this test)
	const userProfileLink = page.locator('[data-testid="user-button"]')
	const dashboardLink = page.locator('[data-testid="dashboard-link"]')
	await expect(userProfileLink).toBeVisible()
	await expect(dashboardLink).toBeVisible()

	// Test if the mobile menu opens and closes when clicking the hamburger icon
	const mobileMenuButton = page.locator('[data-testid="menu-open-button"]')
	await mobileMenuButton.click()
	const mobileMenu = page.locator('[data-testid="mobile-menu-dialog"]')
	await expect(mobileMenu).toBeVisible()

	const closeMenuButton = page.locator('[data-testid="menu-close-button"]')
	await closeMenuButton.click()
	await expect(mobileMenu).not.toBeVisible()
})
