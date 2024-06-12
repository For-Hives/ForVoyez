module.exports = {
	projects: [
		{
			testDir: './tests/e2e/general',
			testMatch: /.*\.spec\.js/,
			retries: 2,
			workers: 2,
		},
		{
			testDir: './tests/e2e/subscribed',
			testMatch: /.*\.spec\.js/,
			name: 'subscribed',
			retries: 2,
			workers: 2,
		},
	],
	use: {
		baseURL: 'http://localhost:3000',
		headless: true,
	},
}
