module.exports = {
	use: {
		viewport: { width: 1280, height: 720 },
		baseURL: 'http://localhost:3000',
		navigationTimeout: 30000,
		actionTimeout: 10000,
		headless: false,
	},
	testDir: './tests',
	timeout: 30000,
	retries: 1,
}
