// node-postgres and a local TCP server: Node environment
// @vitest-environment node

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import pg from 'pg'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { pgAdapterConfig, preferTlsClient } from '@/helpers/databaseUrl'

// the URL parser node-postgres uses, as installed (not a direct dependency)
const parse = createRequire(createRequire(import.meta.url).resolve('pg'))('pg-connection-string')

const BASE = 'postgresql://fvtest:fvtest@127.0.0.1:54329/fvtest'
const UNVERIFIED = { rejectUnauthorized: false }

describe('pgAdapterConfig (Prisma 6 DATABASE_URL on the Prisma 7 pg adapter)', () => {
	let consoleError

	beforeEach(() => {
		consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		consoleError.mockRestore()
	})

	it('reads a URL without sslmode as Prisma 6 prefer: TLS when offered, unverified, with the Prisma 6 timeout', () => {
		const { poolConfig, options } = pgAdapterConfig(BASE)

		expect(poolConfig).toEqual({
			connectionTimeoutMillis: 10_000,
			Client: expect.any(Function),
			connectionString: BASE,
			ssl: UNVERIFIED,
		})
		expect(poolConfig.Client.prototype).toBeInstanceOf(pg.Client)
		expect(options).toBeUndefined()
		// what node-postgres does with it: TLS first (see preferTlsClient)
		expect(new pg.Client(poolConfig).ssl).toEqual(UNVERIFIED)
	})

	it('works without a DATABASE_URL (prisma generate / next build)', () => {
		expect(pgAdapterConfig(undefined)).toEqual({
			poolConfig: {
				connectionTimeoutMillis: 10_000,
				connectionString: undefined,
			},
			options: undefined,
		})
	})

	it('keeps ?schema= for the adapter', () => {
		expect(pgAdapterConfig(`${BASE}?schema=forvoyez`).options).toEqual({
			schema: 'forvoyez',
		})
	})

	it('maps connection_limit to the pool size and the longer timeout', () => {
		const { poolConfig } = pgAdapterConfig(`${BASE}?connection_limit=5&connect_timeout=20&pool_timeout=3`)
		expect(poolConfig.max).toBe(5)
		expect(poolConfig.connectionTimeoutMillis).toBe(20_000)
	})

	it('disables the timeout only when both Prisma 6 timeouts are 0', () => {
		expect(pgAdapterConfig(`${BASE}?connect_timeout=0&pool_timeout=0`).poolConfig.connectionTimeoutMillis).toBe(0)
		expect(pgAdapterConfig(`${BASE}?connect_timeout=0`).poolConfig.connectionTimeoutMillis).toBe(10_000)
	})

	it('ignores invalid values', () => {
		const { poolConfig } = pgAdapterConfig(`${BASE}?connection_limit=abc&pool_timeout=-1`)
		expect(poolConfig.max).toBeUndefined()
		expect(poolConfig.connectionTimeoutMillis).toBe(10_000)
	})

	it('keeps sslmode=require encrypted without certificate verification and without plaintext fallback', () => {
		const { poolConfig } = pgAdapterConfig(`${BASE}?sslmode=require`)

		expect(poolConfig.connectionString).toBe(BASE)
		expect(poolConfig.ssl).toEqual(UNVERIFIED)
		expect(poolConfig.Client).toBeUndefined()
	})

	// Prisma 6 read any sslmode other than disable and require as prefer
	it.each(['prefer', 'verify-full', 'verify-ca', 'no-verify', 'allow'])(
		'reads sslmode=%s as Prisma 6 prefer (TLS when offered, unverified)',
		sslmode => {
			const { poolConfig } = pgAdapterConfig(`${BASE}?sslmode=${sslmode}`)

			expect(poolConfig.connectionString).toBe(BASE)
			expect(poolConfig.ssl).toEqual(UNVERIFIED)
			expect(poolConfig.Client).toEqual(expect.any(Function))
		}
	)

	it('turns TLS off with sslmode=disable', () => {
		const { poolConfig } = pgAdapterConfig(`${BASE}?sslmode=disable`)

		expect(poolConfig.ssl).toBe(false)
		expect(poolConfig.Client).toBeUndefined()
		expect(new pg.Client(poolConfig).ssl).toBe(false)
	})

	it('verifies the certificate with sslaccept=strict', () => {
		for (const [url, Client] of [
			[`${BASE}?sslmode=require&sslaccept=strict`, undefined],
			[`${BASE}?sslaccept=strict`, expect.any(Function)],
		]) {
			const { poolConfig } = pgAdapterConfig(url)
			expect(poolConfig.ssl).toEqual({ rejectUnauthorized: true })
			expect(poolConfig.Client).toEqual(Client)
		}
	})

	describe('certificate files', () => {
		let directory

		beforeEach(() => {
			directory = mkdtempSync(join(tmpdir(), 'fv-db-url-'))
		})

		afterEach(() => {
			rmSync(directory, { recursive: true, force: true })
		})

		it('trusts sslcert as the CA with sslaccept=strict (Prisma 6 CA pinning), not as a client certificate', () => {
			const ca = join(directory, 'server-ca.crt')
			writeFileSync(ca, 'CA PEM')
			const url = `${BASE}?sslmode=require&sslaccept=strict&sslcert=${ca}`

			const { poolConfig } = pgAdapterConfig(url)

			expect(poolConfig.connectionString).toBe(BASE)
			expect(poolConfig.ssl).toEqual({
				ca: Buffer.from('CA PEM'),
				rejectUnauthorized: true,
			})
			expect(new pg.Client(poolConfig).ssl.cert).toBeUndefined()
		})

		it('sends sslidentity as a PKCS#12 client certificate with sslpassword', () => {
			const identity = join(directory, 'client.p12')
			writeFileSync(identity, 'PKCS12')

			const { poolConfig } = pgAdapterConfig(
				`${BASE}?sslmode=require&sslidentity=${identity}&sslpassword=p%40ss` // ggignore: fake test passphrase
			)

			expect(poolConfig.ssl).toEqual({
				pfx: Buffer.from('PKCS12'),
				rejectUnauthorized: false,
				passphrase: 'p@ss', // ggignore: fake test passphrase
			})
		})

		it('resolves relative paths from the prisma/ folder and does not throw for a missing file', () => {
			const { poolConfig } = pgAdapterConfig(`${BASE}?sslaccept=strict&sslcert=missing-ca.crt`)

			expect(poolConfig.ssl).toEqual({ rejectUnauthorized: true })
			expect(consoleError).toHaveBeenCalledWith(
				`DATABASE_URL: cannot read the TLS file ${join(process.cwd(), 'prisma', 'missing-ca.crt')}:`,
				'ENOENT'
			)
		})
	})

	it('removes only the TLS parameters, and keeps the credentials byte for byte', () => {
		const url =
			'postgresql://role:p%40ss%23w%25rd%2F@db.example.com:5432/app?sslmode=require&schema=public&sslaccept=accept_invalid_certs&connection_limit=3&ssl=true&sslrootcert=/ca.crt' // ggignore: fake test password

		const { poolConfig } = pgAdapterConfig(url)

		expect(poolConfig.connectionString).toBe(
			'postgresql://role:p%40ss%23w%25rd%2F@db.example.com:5432/app?schema=public&connection_limit=3' // ggignore: fake test password
		)
		expect(parse(poolConfig.connectionString)).toMatchObject({
			password: 'p@ss#w%rd/', // ggignore: fake test password
			user: 'role',
		})
		expect(parse(poolConfig.connectionString).ssl).toBeUndefined()
	})

	it('passes a URL that opts into node-postgres TLS parameters (uselibpqcompat) on as is', () => {
		for (const url of [
			`${BASE}?sslmode=verify-full&sslrootcert=/ca.crt&uselibpqcompat=true`,
			`${BASE}?sslmode=require&uselibpqcompat=false`,
		]) {
			const { poolConfig } = pgAdapterConfig(url)
			expect(poolConfig).toEqual({
				connectionTimeoutMillis: 10_000,
				connectionString: url,
			})
		}
	})

	it('leaves an unparseable URL untouched', () => {
		expect(pgAdapterConfig('not a url').poolConfig).toEqual({
			connectionTimeoutMillis: 10_000,
			connectionString: 'not a url',
		})
	})
})

function clientConfig(port) {
	return {
		connectionString: `postgresql://fvtest:fvtest@127.0.0.1:${port}/fvtest`,
		connectionTimeoutMillis: 2000,
		ssl: UNVERIFIED,
	}
}

// A PostgreSQL server that has no TLS: it answers "N" to the TLS request and
// accepts any plaintext startup (AuthenticationOk, ReadyForQuery).
async function serverWithoutTls() {
	const server = createServer(socket => {
		server.connections += 1
		socket.on('data', data => {
			const code = data.length >= 8 ? data.readInt32BE(4) : null
			if (code === 80877103) {
				server.tlsRequests += 1
				socket.write('N')
			} else if (code === 196608) {
				socket.write(Buffer.from([...[0x52, 0, 0, 0, 8, 0, 0, 0, 0], ...[0x5a, 0, 0, 0, 5, 0x49]]))
			} else if (data[0] === 0x58) {
				socket.end()
			}
		})
		socket.on('error', () => {})
	})
	server.connections = 0
	server.tlsRequests = 0
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
	return server
}

describe('preferTlsClient (Prisma 6 sslmode=prefer)', () => {
	let server

	afterEach(async () => {
		await new Promise(resolve => server?.close(resolve) ?? resolve())
		server = null
	})

	it('falls back to plaintext when the server has no TLS, and asks the server only once', async () => {
		server = await serverWithoutTls()
		const PreferTlsClient = preferTlsClient()
		const config = clientConfig(server.address().port)

		// plain node-postgres refuses this server
		const plain = new pg.Client(config)
		await expect(plain.connect()).rejects.toThrow('The server does not support SSL connections')
		server.tlsRequests = 0

		const first = new PreferTlsClient(config)
		await first.connect()
		expect(first.ssl).toBe(false)
		expect(server.tlsRequests).toBe(1)

		// callback style, as pg-pool calls it
		const second = new PreferTlsClient(config)
		await new Promise((resolve, reject) => second.connect((error, client) => (error ? reject(error) : resolve(client))))
		expect(second.ssl).toBe(false)
		expect(server.tlsRequests).toBe(1)

		await Promise.all([first.end(), second.end()])
	})

	it('works through a pg Pool, as the Prisma adapter uses it', async () => {
		server = await serverWithoutTls()
		const { poolConfig } = pgAdapterConfig(`postgresql://fvtest:fvtest@127.0.0.1:${server.address().port}/fvtest`)
		const pool = new pg.Pool(poolConfig)

		const clients = await Promise.all([pool.connect(), pool.connect()])

		expect(clients.map(client => client.ssl)).toEqual([false, false])
		expect(server.tlsRequests).toBe(1)
		for (const client of clients) {
			client.release()
		}
		await pool.end()
	})

	it('does not take a server that is down for a server without TLS', async () => {
		server = await serverWithoutTls()
		const port = server.address().port
		await new Promise(resolve => server.close(resolve))
		server = null
		const PreferTlsClient = preferTlsClient()

		await expect(new PreferTlsClient(clientConfig(port)).connect()).rejects.toThrow(/ECONNREFUSED/)

		// a server without TLS: asked again, then plaintext
		server = await serverWithoutTls()
		const client = new PreferTlsClient(clientConfig(server.address().port))
		await client.connect()
		expect(client.ssl).toBe(false)
		expect(server.tlsRequests).toBe(1)
		await client.end()
	})

	it('keeps TLS off when the client was built without it', async () => {
		server = await serverWithoutTls()
		const PreferTlsClient = preferTlsClient()
		const client = new PreferTlsClient({
			...clientConfig(server.address().port),
			ssl: false,
		})

		await client.connect()

		expect(server.tlsRequests).toBe(0)
		await client.end()
	})
})
