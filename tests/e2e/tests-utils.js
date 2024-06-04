export const log = message => {
	const ENABLE_TEST_LOGS = process.env.ENABLE_TEST_LOGS === 'true'
	if (ENABLE_TEST_LOGS) {
		console.info(`[TEST LOG - ${new Date().toISOString()}] ${message}`)
	}
}

export const signIn = async (page, email, password) => {}
