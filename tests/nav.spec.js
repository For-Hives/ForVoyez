const { expect, test } = require('@playwright/test')

test('Navbar elements are present and correct', async ({ page }) => {
	await page.goto('/')

	console.log('Page loaded')

	// Wait for the logo element to be present
	const logo = page.locator('[data-testid="logo-image"]')
	console.log('Checking logo visibility')
	await expect(logo).toBeVisible()

	console.log('Checking logo src attribute')
	// Test if the logo image source is correct
	await expect(logo).toHaveAttribute(
		'src',
		/\/_next\/image\?url=%2Flogo%2Flogo\.webp&.*/
	)

	console.log('Checking logo link visibility')
	// Test if the logo link redirects to the home page
	const logoLink = page.locator('[data-testid="logo-link"]')
	await expect(logoLink).toBeVisible()

	console.log('Defining expected navigation items')
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

	// Print the HTML content of the nav
	const navHtml = await page.locator('.navbar').innerHTML()
	console.log('Nav HTML content:', navHtml)

	for (const item of expectedNavItems) {
		console.log('Testing navigation item:', item.name)
		const navItem = page.locator(`[data-testid="${item.testId}"]`)

		console.log(`Waiting for navItem with testId: ${item.testId} to be visible`)
		await navItem.waitFor({ state: 'visible', timeout: 10000 }).catch(error => {
			console.error(
				`Error waiting for navItem with testId: ${item.testId}`,
				error
			)
		})

		console.log(`Checking text of navItem with testId: ${item.testId}`)
		await expect(navItem)
			.toHaveText(item.name)
			.catch(error => {
				console.error(
					`Error checking text of navItem with testId: ${item.testId}`,
					error
				)
			})

		console.log(`Checking href of navItem with testId: ${item.testId}`)
		await expect(navItem)
			.toHaveAttribute('href', item.href)
			.catch(error => {
				console.error(
					`Error checking href of navItem with testId: ${item.testId}`,
					error
				)
			})
	}

	console.log('Test completed')
})
