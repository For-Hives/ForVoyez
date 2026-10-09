import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execute = promisify(execFile)
const container = `forvoyez-tests-${process.pid}`
const image = 'postgres:18-alpine'

async function ready(attempt = 0) {
	try {
		await execute('docker', [
			'exec',
			container,
			'pg_isready',
			'-h',
			'127.0.0.1',
			'-U',
			'forvoyez',
			'-d',
			'forvoyez_tests',
		])
	} catch (error) {
		if (attempt >= 30) throw error
		await new Promise(resolve => setTimeout(resolve, 500))
		return ready(attempt + 1)
	}
}

try {
	await execute('docker', [
		'run',
		'--detach',
		'--name',
		container,
		'-e',
		'POSTGRES_USER=forvoyez',
		'-e',
		'POSTGRES_PASSWORD=test-only',
		'-e',
		'POSTGRES_DB=forvoyez_tests',
		'-p',
		'127.0.0.1::5432',
		image,
	])
	await ready()
	const { stdout } = await execute('docker', ['port', container, '5432/tcp'])
	const port = stdout.trim().split(':').at(-1)
	// The disposable database overrides any local or CI production credentials.
	const env = {
		...process.env,
		DATABASE_URL: `postgresql://forvoyez:test-only@127.0.0.1:${port}/forvoyez_tests`,
		FORVOYEZ_INTEGRATION_DATABASE: 'disposable',
	}
	async function run(args) {
		const output = await execute('pnpm', args, { env, maxBuffer: 4 * 1024 * 1024 })
		process.stdout.write(output.stdout)
		process.stderr.write(output.stderr)
	}
	await run(['exec', 'prisma', 'migrate', 'deploy'])
	if (!process.argv.includes('--smoke')) {
		await run(['prisma:seed'])
		await run(['exec', 'node', 'check-db-connection.js'])
	}
	await run(
		process.argv.includes('--smoke')
			? ['exec', 'playwright', 'test', '--config', 'playwright.smoke.config.js']
			: ['exec', 'vitest', 'run', '--config', 'vitest.integration.config.mjs']
	)
} catch (error) {
	process.stderr.write(error.stdout ?? '')
	process.stderr.write(error.stderr ?? '')
	process.stderr.write(`${error.message}\n`)
	process.exitCode = 1
} finally {
	await execute('docker', ['rm', '--force', container]).catch(() => undefined)
}
