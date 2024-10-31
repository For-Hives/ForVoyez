export async function register() {
	console.info('next runtime :  ' + process.env.NEXT_RUNTIME)
	console.info('node env :  ' + process.env.NODE_ENV)
	if (
		process.env.NEXT_RUNTIME === 'nodejs'
		// &&
		// process.env.NODE_ENV === 'production'
	) {
		console.info('Instrumentation is enabled, your are in production mode')
		await import('./instrumentation.node.js')
	}

	if (
		process.env.NEXT_RUNTIME === 'edge'
		// &&
		// process.env.NODE_ENV === 'production'
	) {
		console.info('Instrumentation is enabled, your are in production mode')
		await import('./instrumentation.edge.js')
	}
}
