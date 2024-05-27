const { expect, test } = require('@playwright/test')

test('Navbar elements are present and correct', async ({ page }) => {
	await page.goto('/')

	console.info('Page loaded')

	// Wait for the logo element to be present
	const logo = page.locator('[data-testid="logo-image"]')
	console.info('Checking logo visibility')
	await expect(logo).toBeVisible()

	console.info('Checking logo src attribute')
	// Test if the logo image source is correct
	await expect(logo).toHaveAttribute(
		'src',
		/\/_next\/image\?url=%2Flogo%2Flogo\.webp&.*/
	)

	console.info('Checking logo link visibility')
	// Test if the logo link redirects to the home page
	const logoLink = page.locator('[data-testid="logo-link"]')
	await expect(logoLink).toBeVisible()

	console.info('Defining expected navigation items')
	// Define the expected navigation items
	const expectedNavItems = [
		{ testId: 'nav-home', name: 'Home', href: '/' },
		{ testId: 'nav-features', href: '/#features', name: 'Features' },
		{ testId: 'nav-pricing', href: '/#pricing', name: 'Pricing' },
		{
			href: 'https://doc.forvoyez.com/',
			testId: 'nav-documentation',
			name: 'Documentation',
		},
		{ testId: 'nav-contact', href: '/contact', name: 'Contact' },
	]

	for (const item of expectedNavItems) {
		console.info(`Testing navigation item: ${item.name}`)
		const navItem = page.locator(`[data-testid="${item.testId}"]`)
		console.info(
			`Waiting for navItem with testId: ${item.testId} to be visible`
		)
		await navItem.waitFor({ state: 'visible', timeout: 10000 })

		console.info(`Checking text of navItem with testId: ${item.testId}`)
		await expect(navItem).toHaveText(item.name)

		console.info(`Checking href of navItem with testId: ${item.testId}`)
		await expect(navItem).toHaveAttribute('href', item.href)

		if (item.href.startsWith('/')) {
			console.info(`Internal link: ${item.href}`)
			await Promise.all([page.waitForNavigation(), navItem.click()])
			await expect(page).toHaveURL(item.href)
		} else {
			console.info(`External link: ${item.href}`)
			const [newPage] = await Promise.all([
				page.context().waitForEvent('page'),
				navItem.click(),
			])
			await newPage.waitForLoadState('load')
			await expect(newPage).toHaveURL(item.href)
			await newPage.close()
		}

		// Go back to the home page for the next iteration
		await page.goto('/')
	}

	console.info('Testing sign-in button visibility')
	// Test if the sign-in button is visible for signed-out users and links to the correct page
	const signInButton = page.locator('[data-testid="sign-in-button"]')
	await expect(signInButton).toBeVisible()
	await signInButton.click()
	await expect(page).toHaveURL('/sign-in')

	// Go back to the home page
	await page.goto('/')

	console.info('Testing user profile and dashboard link visibility')
	// Test if the user profile and "Go to dashboard" links are visible for signed-in users
	// (You may need to sign in programmatically before running this test)
	const userProfileLink = page.locator('[data-testid="user-button"]')
	const dashboardLink = page.locator('[data-testid="dashboard-link"]')
	await expect(userProfileLink).toBeVisible()
	await expect(dashboardLink).toBeVisible()

	console.info('Testing mobile menu functionality')
	// Test if the mobile menu opens and closes when clicking the hamburger icon
	const mobileMenuButton = page.locator('[data-testid="menu-open-button"]')
	await mobileMenuButton.click()
	const mobileMenu = page.locator('[data-testid="mobile-menu-dialog"]')
	await expect(mobileMenu).toBeVisible()

	const closeMenuButton = page.locator('[data-testid="menu-close-button"]')
	await closeMenuButton.click()
	await expect(mobileMenu).not.toBeVisible()

	console.info('Test completed')
})
