module.exports = {
	use: {
		viewport: { width: 1280, height: 720 },
		baseURL: 'http://localhost:3000',
		navigationTimeout: 100000,
		actionTimeout: 100000,
		headless: false,
	},
	testDir: './tests',
	timeout: 100000,
}
