module.exports = {
	projects: [
		{
			testMatch: /global\.setup\.js/,
			testDir: '.tests/e2e',
			name: 'setup db',
		},
		{
			testDir: './tests/e2e/general',
			testMatch: /.*\.spec\.js/,
			name: 'default',
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
