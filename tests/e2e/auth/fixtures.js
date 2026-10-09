const { test: baseTest } = require('@playwright/test')
try {
	process.loadEnvFile()
} catch (error) {
	if (error.code !== 'ENOENT') throw error
}
const path = require('node:path')
const fs = require('node:fs')

const { getNextPublicUrl, signIn, log } = require('../tests-helpers')

const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD
const TEST_EMAIL_SUB = process.env.TEST_EMAIL_SUB
const TEST_PASSWORD_SUB = process.env.TEST_PASSWORD_SUB

module.exports = {
	...require('@playwright/test'),
	test: baseTest.extend({
		// Authenticate once per worker with a worker-scoped fixture.
		workerStorageState: [
			async ({ browser }, use, testInfo) => {
				// Check if subscribed mode is enabled
				const isSubscribedMode = testInfo.project.name.includes('subscribed')

				// Use parallelIndex as a unique identifier for each worker. The
				// account is part of the name: both projects share the output
				// directory and the worker indexes when they run together.
				const id = baseTest.info().parallelIndex
				const fileName = path.resolve(
					baseTest.info().project.outputDir,
					`.auth/${isSubscribedMode ? 'subscribed' : 'basic'}-${id}.json`
				)

				if (fs.existsSync(fileName)) {
					// Reuse existing authentication state if any.
					await use(fileName)
					return
				}

				// Important: make sure we authenticate in a clean environment by unsetting storage state.
				const page = await browser.newPage({ storageState: undefined })

				// Perform authentication steps based on the mode
				log(`Authenticating in ${isSubscribedMode ? 'subscribed' : 'basic'} mode`)
				if (isSubscribedMode) {
					await signIn(page, getNextPublicUrl(), TEST_EMAIL_SUB, TEST_PASSWORD_SUB)
				} else {
					await signIn(page, getNextPublicUrl(), TEST_EMAIL, TEST_PASSWORD)
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
