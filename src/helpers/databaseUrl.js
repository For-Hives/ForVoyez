// Prisma 7 reaches PostgreSQL through node-postgres (`@prisma/adapter-pg`),
// which reads DATABASE_URL differently from the Prisma 6 engine. This keeps
// the Prisma 6 behaviour of the URL parameters a Prisma 6 DATABASE_URL may
// carry, so the deployed URL keeps working unchanged after the upgrade:
// - `schema`: ignored by node-postgres, passed to the adapter instead.
// - `connect_timeout` (Prisma 6 default 5 s) and `pool_timeout` (10 s):
//   node-postgres waits forever by default, so a database that is down would
//   hang every request. It has a single timeout for both: the longer one.
// - `connection_limit`: the pool size (node-postgres default: 10).
// - `sslmode=require` or `prefer`: Prisma 6 encrypted without verifying the
//   server certificate (unless `sslaccept=strict`), node-postgres treats both
//   as verify-full and refuses e.g. a self-signed certificate. Its
//   libpq-compatible mode (`uselibpqcompat=true`) keeps the Prisma 6 behaviour.

const PRISMA6_CONNECT_TIMEOUT_SECONDS = 5
const PRISMA6_POOL_TIMEOUT_SECONDS = 10

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
		connectionString: withPrisma6SslMode(databaseUrl, params),
		connectionTimeoutMillis: timeoutSeconds * 1000,
	}

	const connectionLimit = Number(params?.get('connection_limit'))
	if (Number.isInteger(connectionLimit) && connectionLimit > 0) {
		poolConfig.max = connectionLimit
	}

	const schema = params?.get('schema')
	return { options: schema ? { schema } : undefined, poolConfig }
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

// Appended as text: the rest of the URL (credentials included) is passed on
// byte for byte.
function withPrisma6SslMode(url, params) {
	const sslMode = params?.get('sslmode')
	if (
		!params ||
		!['prefer', 'require'].includes(sslMode) ||
		params.has('uselibpqcompat') ||
		params.get('sslaccept') === 'strict'
	) {
		return url
	}
	return `${url}${url.includes('?') ? '&' : '?'}uselibpqcompat=true`
}
