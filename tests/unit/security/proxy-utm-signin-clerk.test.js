// The proxy (src/proxy.js) against the real Clerk middleware, where the other
// unit tests get a mock: what Clerk really answers a signed-out visitor, and
// the only thing the campaign parameters (utm_*) change in it. A Clerk update
// that answers differently fails here instead of silently losing the source
// of the visits. Fixture keys of a production instance: without a session
// cookie Clerk decides without any network call.
// @vitest-environment node

import { clerkMiddleware } from '@clerk/nextjs/server'
import { exportJWK, generateKeyPair, SignJWT } from 'jose'
import { NextRequest } from 'next/server'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import proxy from '@/proxy'

const network = vi.hoisted(() => {
	// Clerk reads its configuration when it is loaded. Fixtures, never a live Clerk account.
	vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', `pk_live_${btoa('clerk.forvoyez.test$')}`)
	vi.stubEnv('CLERK_SECRET_KEY', 'sk_live_forvoyez_unit_fixture')
	vi.stubEnv('NEXT_PUBLIC_CLERK_SIGN_IN_URL', '/sign-in')
	vi.stubEnv('NEXT_PUBLIC_CLERK_SIGN_UP_URL', '/sign-up')
	// whatever the machine running the tests has set
	for (const name of [
		'CLERK_API_URL',
		'CLERK_API_VERSION',
		'NEXT_PUBLIC_CLERK_DOMAIN',
		'NEXT_PUBLIC_CLERK_IS_SATELLITE',
		'NEXT_PUBLIC_CLERK_PROXY_URL',
	]) {
		vi.stubEnv(name, '')
	}
	vi.stubEnv('NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED', '1')

	const fetch = vi.fn(() => Promise.reject(new Error('no network in unit tests')))
	vi.stubGlobal('fetch', fetch)
	return fetch
})

vi.mock('@clerk/nextjs/server', async () => {
	const { createRequire } = await import('node:module')
	// Clerk's ESM build only resolves through a bundler: Node loads the CommonJS one.
	const clerk = createRequire(import.meta.url)('@clerk/nextjs/server')
	return { clerkMiddleware: clerk.clerkMiddleware }
})

// The proxy as it was before the campaign parameters: the reference for all
// that must not change.
const formerProxy = clerkMiddleware(async (auth, req) => {
	if (/^\/app\/legals/i.test(req.nextUrl.pathname)) return
	if (/^\/app/i.test(req.nextUrl.pathname)) await auth.protect()
})

const SITE = 'https://forvoyez.com'
const PLUGIN_LINK = '/app/plans?utm_source=wordpress-plugin&utm_medium=plugin&utm_campaign=1.1.43&utm_content=credits'
const PLUGIN_UTM = PLUGIN_LINK.split('?')[1]

const DOCUMENT = {
	accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'sec-fetch-dest': 'document',
	'sec-fetch-mode': 'navigate',
}
// The app listens on a private address behind the reverse proxy of the host.
const BEHIND_REVERSE_PROXY = {
	origin: 'http://10.0.1.7:3000',
	headers: { ...DOCUMENT, host: '10.0.1.7:3000', 'x-forwarded-host': 'forvoyez.com', 'x-forwarded-proto': 'https' },
}

const event = { waitUntil() {} }

// The same request for both proxies: status and headers of each answer.
async function answers(path, { origin = SITE, headers = DOCUMENT, method = 'GET' } = {}) {
	const request = () => new NextRequest(`${origin}${path}`, { headers, method })
	const [now, former] = await Promise.all([proxy(request(), event), formerProxy(request(), event)])
	return { now: read(now), former: read(former) }
}

function read(response) {
	const headers = Object.fromEntries(response.headers)
	// the not-found rewrite is stamped with the time
	if (headers['x-middleware-rewrite']) {
		headers['x-middleware-rewrite'] = headers['x-middleware-rewrite'].replace(/clerk_\d+/, 'clerk_<time>')
	}
	return { status: response.status, headers }
}

const signInOf = answer => new URL(answer.headers.location)

afterEach(() => {
	expect(network).not.toHaveBeenCalled()
})

afterAll(() => {
	vi.unstubAllEnvs()
	vi.unstubAllGlobals()
})

describe('a signed-out visitor following a campaign link to the dashboard', () => {
	it('is sent by Clerk to our sign-in page, the utm_* buried in redirect_url', async () => {
		const { former } = await answers(PLUGIN_LINK)

		expect(former.status).toBe(307)
		expect(former.headers.location).toBe(`${SITE}/sign-in?redirect_url=${encodeURIComponent(`${SITE}${PLUGIN_LINK}`)}`)
		expect(former.headers['x-clerk-auth-status']).toBe('signed-out')
	})

	it('now gets the same redirect with the utm_* repeated at the top level', async () => {
		const { now, former } = await answers(PLUGIN_LINK)

		expect(now.headers.location).toBe(`${former.headers.location}&${PLUGIN_UTM}`)
		expect(now).toEqual({
			status: former.status,
			headers: { ...former.headers, location: now.headers.location },
		})
		expect(Object.fromEntries(signInOf(now).searchParams)).toEqual({
			redirect_url: `${SITE}${PLUGIN_LINK}`,
			utm_source: 'wordpress-plugin',
			utm_medium: 'plugin',
			utm_campaign: '1.1.43',
			utm_content: 'credits',
		})
	})

	it('comes back to the very address Clerk would send them to', async () => {
		const { now, former } = await answers(PLUGIN_LINK)

		expect(signInOf(now).searchParams.getAll('redirect_url')).toEqual([
			signInOf(former).searchParams.get('redirect_url'),
		])
		expect(signInOf(now).origin + signInOf(now).pathname).toBe(signInOf(former).origin + signInOf(former).pathname)
	})

	it('keeps the public origin Clerk reads from the forwarded headers', async () => {
		const { now, former } = await answers(PLUGIN_LINK, BEHIND_REVERSE_PROXY)

		expect(former.headers.location).toBe(`${SITE}/sign-in?redirect_url=${encodeURIComponent(`${SITE}${PLUGIN_LINK}`)}`)
		expect(now.headers.location).toBe(`${former.headers.location}&${PLUGIN_UTM}`)
	})

	it('only carries the valid utm_* of a link stuffed with hostile ones', async () => {
		const path = `/app?${[
			'utm_source=wordpress-plugin',
			'utm_medium=%3Cscript%3Ealert(1)%3C%2Fscript%3E',
			'utm_campaign=https%3A%2F%2Fevil.example%2F',
			'utm_content=line%0D%0ASet-Cookie%3A%20a%3Db',
			`utm_term=${'a'.repeat(101)}`,
			'UTM_ID=1',
			'redirect_url=https%3A%2F%2Fevil.example%2F',
			'email=jane%40example.com',
		].join('&')}`
		const { now, former } = await answers(path)

		expect(now.headers.location).toBe(`${former.headers.location}&utm_source=wordpress-plugin`)
		expect(signInOf(now).searchParams.getAll('redirect_url')).toEqual([`${SITE}${path}`])
		expect(signInOf(now).origin).toBe(SITE)
	})
})

describe('what Clerk answers is otherwise untouched', () => {
	it.each([
		['a signed-out visitor without utm_*', '/app/plans?plan=growth', {}, 307],
		['a campaign link with nothing valid in it', '/app?utm_source=%3Cb%3E&utm_medium=', {}, 307],
		['a form posted to a dashboard page', PLUGIN_LINK, { method: 'POST' }, 307],
		[
			'a server action',
			PLUGIN_LINK,
			{ method: 'POST', headers: { accept: 'text/x-component', 'next-action': 'abc123', 'next-url': '/app/plans' } },
			401,
		],
		// outside the Next server Clerk rewrites it to the not-found page (a 200 here)
		['an API-like request', PLUGIN_LINK, { headers: { accept: 'application/json' } }, 200],
		['a client-side navigation', PLUGIN_LINK, { headers: { accept: '*/*', 'next-url': '/', rsc: '1' } }, 307],
		['a legal document', '/app/legals/terms?utm_source=wordpress-plugin', {}, 200],
		['a public page', '/?utm_source=wordpress-plugin&utm_medium=plugin', {}, 200],
		['the sign-in page itself', `/sign-in?${PLUGIN_UTM}`, {}, 200],
	])('%s', async (_label, path, request, status) => {
		const { now, former } = await answers(path, request)

		expect(former.status).toBe(status)
		expect(now).toEqual(former)
	})

	it('serves the legal documents and the public pages without a redirect', async () => {
		const answersOf = await Promise.all(
			['/app/legals/terms?utm_source=wordpress-plugin', '/?utm_source=wordpress-plugin'].map(path => answers(path))
		)

		for (const { now } of answersOf) {
			expect(now.status).toBe(200)
			expect(now.headers.location).toBeUndefined()
		}
	})
})

describe('a signed-in visitor following the same link', () => {
	it('is served the page, exactly as before', async () => {
		// A session token signed here, and its public key answered in place of Clerk's API.
		const { privateKey, publicKey } = await generateKeyPair('RS256')
		const key = { ...(await exportJWK(publicKey)), alg: 'RS256', kid: 'ins_unit_fixture', use: 'sig' }
		const issuedAt = Math.floor(Date.now() / 1000) - 10
		const token = await new SignJWT({ sid: 'sess_unit_fixture' })
			.setProtectedHeader({ alg: 'RS256', kid: key.kid })
			.setSubject('user_unit_fixture')
			.setIssuer('https://clerk.forvoyez.test')
			.setIssuedAt(issuedAt)
			.setNotBefore(issuedAt)
			.setExpirationTime(issuedAt + 120)
			.sign(privateKey)
		const headers = { ...DOCUMENT, cookie: `__session=${token}; __client_uat=${issuedAt - 10}` }
		network.mockImplementation(() => Promise.resolve(Response.json({ keys: [key] })))

		try {
			const { now, former } = await answers(PLUGIN_LINK, { headers })

			expect(former.status).toBe(200)
			expect(former.headers.location).toBeUndefined()
			expect(former.headers['x-middleware-request-x-clerk-auth-status']).toBe('signed-in')
			expect(now).toEqual(former)
			// nothing but Clerk's public keys was asked for
			expect(new Set(network.mock.calls.map(([url]) => String(url)))).toEqual(
				new Set(['https://api.clerk.com/v1/jwks'])
			)
		} finally {
			network.mockReset()
		}
	})
})
