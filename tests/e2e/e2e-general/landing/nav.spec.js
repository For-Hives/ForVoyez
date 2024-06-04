const { expect, test } = require('@playwright/test')
const { log } = require('../../tests-utils')

test('Navbar elements are present and correct', async ({ page }) => {
	await page.goto('/')

	log('Page loaded')

	// Wait for the logo element to be present
	const logo = page.locator('[data-testid="logo-image"]')
	log('Checking logo visibility')
	await expect(logo).toBeVisible()

	log('Checking logo src attribute')
	// Test if the logo image source is correct
	await expect(logo).toHaveAttribute(
		'src',
		/\/_next\/image\?url=%2Flogo%2Flogo\.webp&.*/
	)

	log('Checking logo link visibility')
	// Test if the logo link redirects to the home page
	const logoLink = page.locator('[data-testid="logo-link"]')
	await expect(logoLink).toBeVisible()

	log('Defining expected navigation items')
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
		log(`Testing navigation item: ${item.name}`)
		const navItem = page.locator(`[data-testid="${item.testId}"]`)
		log(`Waiting for navItem with testId: ${item.testId} to be visible`)
		await navItem.waitFor({ state: 'visible', timeout: 10000 })

		log(`Checking text of navItem with testId: ${item.testId}`)
		await expect(navItem).toHaveText(item.name)

		log(`Checking href of navItem with testId: ${item.testId}`)
		await expect(navItem).toHaveAttribute('href', item.href)
	}

	log('Test for presence of elements completed')
})

test('Navbar internal links redirect correctly', async ({ page }) => {
	await page.goto('/')

	log('Page loaded')

	const internalNavItems = [
		{ testId: 'nav-home', href: '/' },
		{ testId: 'nav-features', href: '/#features' },
		{ testId: 'nav-pricing', href: '/#pricing' },
		{ testId: 'nav-contact', href: '/contact' },
	]

	for (const item of internalNavItems) {
		log(`Testing navigation item: ${item.testId}`)
		const navItem = page.locator(`[data-testid="${item.testId}"]`)
		log(`Waiting for navItem with testId: ${item.testId} to be visible`)
		await navItem.waitFor({ state: 'visible', timeout: 10000 })

		log(`Clicking navItem with testId: ${item.testId}`)
		log(`Internal link: ${item.href}`)
		await Promise.all([page.waitForNavigation(), navItem.click()])
		await expect(page).toHaveURL(item.href)

		// Go back to the home page for the next iteration
		await page.goto('/')
	}

	log('Test for internal link redirections completed')
})

test('Navbar external links have correct href', async ({ page }) => {
	await page.goto('/')

	log('Page loaded')

	const externalNavItems = [
		{
			href: 'https://doc.forvoyez.com/',
			testId: 'nav-documentation',
		},
	]

	for (const item of externalNavItems) {
		log(`Testing navigation item: ${item.testId}`)
		const navItem = page.locator(`[data-testid="${item.testId}"]`)
		log(`Waiting for navItem with testId: ${item.testId} to be visible`)
		await navItem.waitFor({ state: 'visible', timeout: 10000 })

		log(`Checking href of navItem with testId: ${item.testId}`)
		await expect(navItem).toHaveAttribute('href', item.href)
	}

	log('Test for external link href completed')
})
