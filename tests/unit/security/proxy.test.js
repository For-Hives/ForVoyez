// Which requests go through the Clerk proxy (src/proxy.js), with the matcher
// compiled by Next itself.
// @vitest-environment node
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { readdirSync, readFileSync } from 'fs'
import { describe, expect, it } from 'vitest'
import { config } from '@/proxy'
import path from 'path'

const matches = url =>
	unstable_doesMiddlewareMatch({ url: `http://localhost${url}`, config })

describe('Clerk proxy matcher', () => {
	it.each([
		'/',
		'/app',
		'/app/tokens',
		'/app/playground',
		'/app/legals/terms',
		'/sign-in',
		'/sign-up/verify',
		'/profile',
		'/contact',
		'/wordpress-plugin',
		'/apidoc',
		'/this-page-does-not-exist',
	])('runs on the page %s (and on its server actions)', url => {
		expect(matches(url)).toBe(true)
	})

	it('runs on a server action POST to a dashboard page', () => {
		expect(
			unstable_doesMiddlewareMatch({
				headers: { 'next-action': 'abc123' },
				url: 'http://localhost/app/tokens',
				config,
			})
		).toBe(true)
	})

	// The API authenticates with its own API keys, HMAC or secret and never
	// calls Clerk: Clerk would only try to verify the API key as a session.
	it.each([
		'/api',
		'/api/describe',
		'/api/tokens',
		'/api/webhook',
		'/api/sync',
		'/api/sync?true=true',
		'/api/unknown',
	])('skips the API route %s', url => {
		expect(matches(url)).toBe(false)
	})

	it.each(['/_next/static/chunks/main.js', '/logo/logo.webp', '/favicon.ico'])(
		'skips the static file %s',
		url => {
			expect(matches(url)).toBe(false)
		}
	)

	// Clerk's auth() and currentUser() throw when the proxy did not run
	it('no API route uses Clerk', () => {
		const apiDir = path.resolve(__dirname, '../../../src/app/api')
		const routes = readdirSync(apiDir, { recursive: true }).filter(file =>
			file.endsWith('.js')
		)

		expect(routes.length).toBeGreaterThanOrEqual(4)
		for (const route of routes) {
			expect(readFileSync(path.join(apiDir, route), 'utf8')).not.toMatch(
				/@clerk\/|\bauth\(\)|currentUser\(/
			)
		}
	})
})
