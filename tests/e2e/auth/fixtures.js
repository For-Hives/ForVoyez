const { test: baseTest, expect } = require('@playwright/test')
const fs = require('fs')
const path = require('path')
const { getNextPublicUrl, signIn } = require('../tests-helpers')

require('dotenv').config()

const NEXT_PUBLIC_URL = getNextPublicUrl()
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

module.exports = {
	...require('@playwright/test'),
	test: baseTest.extend({
		// Authenticate once per worker with a worker-scoped fixture.
		workerStorageState: [
			async ({}, use) => {
				// Use parallelIndex as a unique identifier for each worker.
				const id = test.info().parallelIndex
				const fileName = path.resolve(
					test.info().project.outputDir,
					`.auth/${id}.json`
				)

				if (fs.existsSync(fileName)) {
					// Reuse existing authentication state if any.
					await use(fileName)
					return
				}

				// Important: make sure we authenticate in a clean environment by unsetting storage state.
				const page = await browser.newPage({ storageState: undefined })

				// Perform authentication steps.
				await signIn(page, NEXT_PUBLIC_URL, TEST_EMAIL, TEST_PASSWORD)

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
