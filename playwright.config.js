module.exports = {
	projects: [
		{
			testDir: './tests/e2e/general',
			testMatch: /.*\.spec\.js/,
			name: 'general',
			timeout: 50000,
			retries: 1,
			workers: 2,
		},
		{
			testDir: './tests/e2e/subscribed',
			testMatch: /.*\.spec\.js/,
			name: 'subscribed',
			timeout: 50000,
			retries: 1,
			workers: 2,
		},
	],
	use: {
		reporter: [['html', { outputFolder: 'test-results', open: 'never' }]],
		baseURL: 'http://localhost:3000',
		video: 'retain-on-failure',
		outputDir: 'test-results',
		trace: 'on-first-retry',
		console: 'verbose',
		headless: true,
	},
}
