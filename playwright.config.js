module.exports = {
	projects: [
		{
			testDir: './tests/e2e/general',
			testMatch: /.*\.spec\.js/,
			name: 'default',
			timeout: 60000,
			retries: 2,
			workers: 2,
		},
		{
			testDir: './tests/e2e/subscribed',
			testMatch: /.*\.spec\.js/,
			name: 'subscribed',
			timeout: 60000,
			retries: 2,
			workers: 2,
		},
	],
	use: {
		baseURL: 'http://localhost:3000',
		video: 'retain-on-failure',
		outputDir: 'test-results',
		trace: 'on-first-retry',
		headless: true,
	},
}
