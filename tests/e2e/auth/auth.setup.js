import { test as setup } from '@playwright/test'

import { getNextPublicUrl, signIn } from '../tests-helpers'

require('dotenv').config()

const NEXT_PUBLIC_URL = getNextPublicUrl()
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

const authFile = 'tests/e2e/auth/auth.setup.js'

setup('authenticate', async ({ page }) => {
	await signIn(NEXT_PUBLIC_URL, TEST_EMAIL, TEST_PASSWORD)
	// Save the session cookies
	await page.context().storageState({ path: 'tests/e2e/auth/user.json' })
})
