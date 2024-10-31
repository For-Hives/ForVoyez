export async function register() {
	if (
		process.env.NEXT_RUNTIME === 'nodejs' &&
		process.env.NODE_ENV === 'production'
	) {
		console.info('Instrumentation is enabled, your are in production mode')
		await import('./instrumentation.node.js')
	}
}
