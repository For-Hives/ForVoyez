const { expect, test } = require('@playwright/test')

test('Navbar elements are present and correct', async ({ page }) => {
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
	await expect(logoLink).toBeVisible()
	await logoLink.click()
	await expect(page).toHaveURL('/')

	// Define the expected navigation items
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
		console.info(`Testing navigation item: ${item.name}`)
		const navItem = page.locator(`[data-testid="${item.testId}"]`)
		console.log('NavItem:', navItem)
		await navItem.waitFor({ state: 'visible', timeout: 10000 }) // Wait for the navigation item to be present

		// Verify the text and href of the navigation item
		await expect(navItem).toHaveText(item.name)
		await expect(navItem).toHaveAttribute('href', item.href)
	}
})

test('Navbar links are clickable and redirect correctly', async ({ page }) => {
	await page.goto('/')

	// Define the expected navigation items
	const expectedNavItems = [
		{ testId: 'nav-home', href: '/' },
		{ testId: 'nav-features', href: '/#features' },
		{ testId: 'nav-pricing', href: '/#pricing' },
		{
			href: 'https://doc.forvoyez.com/',
			testId: 'nav-docs',
		},
		{ testId: 'nav-contact', href: '/contact' },
	]

	for (const item of expectedNavItems) {
		console.info(`Testing navigation item: ${item.testId}`)
		const navItem = page.locator(`[data-testid="${item.testId}"]`)
		await navItem.waitFor({ state: 'visible', timeout: 10000 }) // Wait for the navigation item to be present

		// Click on the navigation item and check if it redirects to the correct page
		if (item.href.startsWith('/')) {
			console.log('Internal link:', item.href)
			await Promise.all([page.waitForNavigation(), navItem.click()])
			await expect(page).toHaveURL(item.href)
		} else {
			console.info('External link:', item.href)
			// For external links, click the link and verify that it opened the expected URL
			await navItem.click()
			// Verify that the current URL matches the expected external URL
			await page.evaluate(href => {
				window.open(href, '_blank')
			}, item.href)

			// Verify the URL in a new context or frame (this part can vary based on your testing setup)
			const pages = await page.context().pages()
			const newPage = pages[pages.length - 1] // Get the most recently opened page
			await newPage.waitForLoadState('load') // Wait for the new page to load completely
			await expect(newPage).toHaveURL(item.href)
			await newPage.close() // Close the new page
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
