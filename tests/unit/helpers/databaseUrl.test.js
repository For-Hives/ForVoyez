import { describe, expect, it } from 'vitest'
import { createRequire } from 'module'

import { pgAdapterConfig } from '@/helpers/databaseUrl'

// the URL parser node-postgres uses, as installed (not a direct dependency)
const requireFromAdapter = createRequire(
	createRequire(import.meta.url).resolve('@prisma/adapter-pg')
)
const parse = createRequire(requireFromAdapter.resolve('pg'))(
	'pg-connection-string'
)

const BASE = 'postgresql://fvtest:fvtest@127.0.0.1:54329/fvtest'

describe('pgAdapterConfig (Prisma 6 DATABASE_URL on the Prisma 7 pg adapter)', () => {
	it('passes a plain URL through, with the Prisma 6 timeout instead of none', () => {
		expect(pgAdapterConfig(BASE)).toEqual({
			poolConfig: { connectionTimeoutMillis: 10_000, connectionString: BASE },
			options: undefined,
		})
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
		const { poolConfig } = pgAdapterConfig(
			`${BASE}?connection_limit=5&connect_timeout=20&pool_timeout=3`
		)
		expect(poolConfig.max).toBe(5)
		expect(poolConfig.connectionTimeoutMillis).toBe(20_000)
	})

	it('disables the timeout only when both Prisma 6 timeouts are 0', () => {
		expect(
			pgAdapterConfig(`${BASE}?connect_timeout=0&pool_timeout=0`).poolConfig
				.connectionTimeoutMillis
		).toBe(0)
		expect(
			pgAdapterConfig(`${BASE}?connect_timeout=0`).poolConfig
				.connectionTimeoutMillis
		).toBe(10_000)
	})

	it('ignores invalid values', () => {
		const { poolConfig } = pgAdapterConfig(
			`${BASE}?connection_limit=abc&pool_timeout=-1`
		)
		expect(poolConfig.max).toBeUndefined()
		expect(poolConfig.connectionTimeoutMillis).toBe(10_000)
	})

	it.each(['require', 'prefer'])(
		'keeps sslmode=%s encrypted without certificate verification, like Prisma 6',
		sslmode => {
			const url = `${BASE}?sslmode=${sslmode}`
			const { connectionString } = pgAdapterConfig(url).poolConfig

			expect(connectionString).toBe(`${url}&uselibpqcompat=true`)
			// what node-postgres does with it
			expect(parse(connectionString).ssl).toEqual({ rejectUnauthorized: false })
		}
	)

	it('keeps certificate verification when it was asked for', () => {
		for (const url of [
			`${BASE}?sslmode=require&sslaccept=strict`,
			`${BASE}?sslmode=verify-full`,
			`${BASE}?sslmode=require&uselibpqcompat=false`,
			`${BASE}?sslmode=disable`,
		]) {
			expect(pgAdapterConfig(url).poolConfig.connectionString).toBe(url)
		}
	})

	it('leaves an unparseable URL untouched', () => {
		expect(pgAdapterConfig('not a url').poolConfig.connectionString).toBe(
			'not a url'
		)
	})
})
