const { test: baseTest, expect } = require('@playwright/test')
const fs = require('fs')
const path = require('path')
const { getNextPublicUrl, signIn } = require('../tests-helpers')

require('dotenv').config()

const NEXT_PUBLIC_URL = getNextPublicUrl()
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD
const SUBSCRIBED_USER_EMAIL = process.env.SUBSCRIBED_USER_EMAIL
const SUBSCRIBED_USER_PASSWORD = process.env.SUBSCRIBED_USER_PASSWORD

module.exports = {
	...require('@playwright/test'),
	test: baseTest.extend({
		// Authenticate once per worker with a worker-scoped fixture.
		workerStorageState: [
			async ({ browser }, use, testInfo) => {
				// Use parallelIndex as a unique identifier for each worker.
				const id = baseTest.info().parallelIndex
				const fileName = path.resolve(
					baseTest.info().project.outputDir,
					`.auth/${id}.json`
				)

				if (fs.existsSync(fileName)) {
					// Reuse existing authentication state if any.
					await use(fileName)
					return
				}

				// Check if subscribed mode is enabled
				const isSubscribedMode = testInfo.project.name.includes('subscribed')

				// Important: make sure we authenticate in a clean environment by unsetting storage state.
				const page = await browser.newPage({ storageState: undefined })

				// Perform authentication steps based on the mode
				if (isSubscribedMode) {
					await signIn(
						page,
						NEXT_PUBLIC_URL,
						SUBSCRIBED_USER_EMAIL,
						SUBSCRIBED_USER_PASSWORD
					)
				} else {
					await signIn(page, NEXT_PUBLIC_URL, TEST_EMAIL, TEST_PASSWORD)
				}

				await page.context().storageState({ path: fileName })
				await page.close()
				await use(fileName)
			},
			{ scope: 'worker' },
		],

		// Use the same storage state for all tests in this worker.
		storageState: async ({ workerStorageState }, use) => {
			await use(workerStorageState)
		},
	}),
}