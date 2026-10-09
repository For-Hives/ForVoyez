import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { callbackify } from 'node:util'
import pg from 'pg'

// Prisma 7 reaches PostgreSQL through node-postgres (`@prisma/adapter-pg`),
// which reads DATABASE_URL differently from the Prisma 6 engine. This keeps
// the Prisma 6 behaviour of the URL parameters a Prisma 6 DATABASE_URL may
// carry, so the deployed URL keeps working unchanged after the upgrade:
// - `schema`: ignored by node-postgres, passed to the adapter instead.
// - `connect_timeout` (Prisma 6 default 5 s) and `pool_timeout` (10 s):
//   node-postgres waits forever by default, so a database that is down would
//   hang every request. It has a single timeout for both: the longer one.
// - `connection_limit`: the pool size (node-postgres default: 10).
// - TLS (see prisma6Tls): `sslmode` (`prefer` when missing: TLS when the
//   server offers it, plaintext otherwise), `sslaccept`, `sslcert`,
//   `sslidentity` and `sslpassword`. node-postgres has no `prefer` (no TLS
//   at all without `sslmode`, no plaintext fallback with it) and verifies
//   the certificate for any `sslmode`, where Prisma 6 only verified it with
//   `sslaccept=strict`.
// A URL with `uselibpqcompat` opts into node-postgres' own reading of the
// TLS parameters (libpq `sslmode` values, `sslrootcert`...) and is passed on
// as is.

const PRISMA6_CONNECT_TIMEOUT_SECONDS = 5
const PRISMA6_POOL_TIMEOUT_SECONDS = 10

// Removed from the URL given to node-postgres: it turns `ssl`, `sslmode`,
// `sslcert`, `sslkey` and `sslrootcert` into its own `ssl` option, which would
// override the one built here. The others are Prisma 6 only.
const TLS_PARAMS = ['ssl', 'sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'sslaccept', 'sslidentity', 'sslpassword']

// node-postgres error when the server answers "no" to the TLS request
const NO_TLS_ERROR = 'The server does not support SSL connections'

/**
 * Builds the `PrismaPg` arguments for a Prisma 6 style DATABASE_URL.
 * @param {string | undefined} databaseUrl
 * @returns {{ poolConfig: import('pg').PoolConfig, options: { schema: string } | undefined }}
 */
export function pgAdapterConfig(databaseUrl) {
	const params = searchParamsOf(databaseUrl)

	const timeoutSeconds = Math.max(
		secondsParam(params, 'connect_timeout', PRISMA6_CONNECT_TIMEOUT_SECONDS),
		secondsParam(params, 'pool_timeout', PRISMA6_POOL_TIMEOUT_SECONDS)
	)

	const poolConfig = {
		connectionTimeoutMillis: timeoutSeconds * 1000,
		connectionString: databaseUrl,
	}

	if (params && !params.has('uselibpqcompat')) {
		Object.assign(poolConfig, prisma6Tls(databaseUrl, params))
	}

	const connectionLimit = Number(params?.get('connection_limit'))
	if (Number.isInteger(connectionLimit) && connectionLimit > 0) {
		poolConfig.max = connectionLimit
	}

	const schema = params?.get('schema')
	return { options: schema ? { schema } : undefined, poolConfig }
}

/**
 * node-postgres Client class for Prisma 6's `sslmode=prefer` (its default):
 * TLS when the server offers it, plaintext when the server answers that it
 * has no TLS. Before the first connection, one throwaway connection asks the
 * server; every connection then uses its answer. Other failures (server
 * down, wrong password) do not count as an answer.
 * @param {typeof import('pg').Client} [BaseClient]
 * @returns {typeof import('pg').Client}
 */
export function preferTlsClient(BaseClient = pg.Client) {
	// undefined until the server answered the TLS request
	let serverHasTls
	let pendingProbe = null

	async function probe(config) {
		const client = new BaseClient(config)
		try {
			await client.connect()
			return true
		} catch (error) {
			return error?.message === NO_TLS_ERROR ? false : undefined
		} finally {
			client.end().catch(() => {
				// Closing a failed TLS probe must not replace its connection result.
			})
		}
	}

	return class PreferTlsClient extends BaseClient {
		#config

		constructor(config) {
			super(config)
			this.#config = config
		}

		// promise or callback (pg-pool), like pg's Client#connect
		connect(callback) {
			const connect = () => this.#negotiateTls().then(() => super.connect())
			return callback ? callbackify(connect)(callback) : connect()
		}

		async #negotiateTls() {
			if (!this.ssl) {
				return
			}
			if (serverHasTls === undefined) {
				pendingProbe ??= probe(this.#config).finally(() => {
					pendingProbe = null
				})
				serverHasTls = await pendingProbe
			}
			if (serverHasTls === false) {
				// node-postgres 8 reads both when the connection starts
				this.ssl = false
				this.connection.ssl = false
			}
		}
	}
}

// Prisma 6 TLS settings (quaint): `sslmode` disable, prefer (default, and any
// unknown value such as verify-full) or require; the certificate is only
// verified with `sslaccept=strict`, against `sslcert` (a CA file, relative
// to the prisma/ folder) when given; `sslidentity` is a PKCS#12 client
// certificate protected by `sslpassword`.
function prisma6Tls(url, params) {
	const connectionString = withoutParams(url, TLS_PARAMS)
	const sslMode = params.get('sslmode')

	if (sslMode === 'disable') {
		return { connectionString, ssl: false }
	}

	const ssl = { rejectUnauthorized: params.get('sslaccept') === 'strict' }
	if (ssl.rejectUnauthorized && params.get('sslcert')) {
		const ca = readPrismaFile(params.get('sslcert'))
		if (ca) {
			ssl.ca = ca
		}
	}
	if (params.get('sslidentity')) {
		const pfx = readPrismaFile(params.get('sslidentity'))
		if (pfx) {
			ssl.pfx = pfx
			ssl.passphrase = params.get('sslpassword') ?? undefined
		}
	}

	if (sslMode === 'require') {
		return { connectionString, ssl }
	}
	return { Client: preferTlsClient(), connectionString, ssl }
}

// Prisma 6 resolved certificate paths from the prisma/ folder. A missing
// file is not thrown here (this runs at import, `next build` included): the
// connection then fails the TLS checks instead.
function readPrismaFile(path) {
	const file = isAbsolute(path) ? path : resolve(process.cwd(), 'prisma', path)
	try {
		return readFileSync(file)
	} catch (error) {
		console.error(`DATABASE_URL: cannot read the TLS file ${file}:`, error.code ?? error.message)
		return undefined
	}
}

function searchParamsOf(url) {
	try {
		return new URL(url).searchParams
	} catch {
		return null
	}
}

// Prisma 6: 0 disables the timeout, a missing or invalid value is the default
function secondsParam(params, name, fallback) {
	const value = params?.get(name)
	if (value == null || value.trim() === '') {
		return fallback
	}
	const seconds = Number(value)
	return Number.isFinite(seconds) && seconds >= 0 ? seconds : fallback
}

// Edits the query string as text: the rest of the URL (credentials
// included) is passed on byte for byte.
function withoutParams(url, names) {
	const queryStart = url.indexOf('?')
	if (queryStart === -1) {
		return url
	}
	const kept = url
		.slice(queryStart + 1)
		.split('&')
		.filter(pair => !names.includes(pair.split('=')[0]))
	const base = url.slice(0, queryStart)
	return kept.length > 0 ? `${base}?${kept.join('&')}` : base
}
