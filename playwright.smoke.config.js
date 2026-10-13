const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
	testDir: './tests/smoke',
	fullyParallel: true,
	retries: 0,
	use: { baseURL: 'http://127.0.0.1:3041' },
	webServer: {
		command: 'pnpm start --port 3041',
		url: 'http://127.0.0.1:3041',
		reuseExistingServer: false,
		timeout: 30000,
		env: {
			// The build has no SYNC_SECRET (CI, Docker image): the route must still
			// obey one given at runtime. Fixture value, and no Lemon Squeezy key so
			// that an accepted call fails before any request leaves the machine.
			SYNC_SECRET: 'smoke-sync-secret-fixture',
			LEMON_SQUEEZY_API_KEY: '',
			// Anonymous HTTP smoke tests use fixture keys, never a live Clerk account.
			NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: `pk_test_${Buffer.from('smoke.clerk.accounts.dev$').toString('base64')}`,
			CLERK_SECRET_KEY: 'sk_test_forvoyez_anonymous_smoke_fixture',
		},
	},
})
