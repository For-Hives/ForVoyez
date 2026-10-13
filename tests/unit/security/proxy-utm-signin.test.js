// Campaign parameters (utm_*) repeated on the redirect to the sign-in page
// (src/proxy.js). Clerk is replaced here by answers chosen by each test, to
// reach the cases the real one cannot be put in from a unit test (signed in,
// handshake, account portal). proxy-utm-signin-clerk.test.js runs the same
// proxy against the real Clerk middleware.
// @vitest-environment node

import { NextRequest, NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import proxy from '@/proxy'

const clerk = vi.hoisted(() => ({ answer: undefined, auth: undefined }))

vi.mock('@clerk/nextjs/server', () => ({
	// Runs our handler, then answers what the test says Clerk answered.
	clerkMiddleware: handler => async (request, event) => {
		await handler(clerk.auth, request, event)
		return clerk.answer
	},
}))

const SITE = 'https://forvoyez.com'
const PLUGIN_LINK = '/app/plans?utm_source=wordpress-plugin&utm_medium=plugin&utm_campaign=1.1.43&utm_content=credits'

// What a browser sends when it opens a page.
const PAGE_VISIT = { accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' }

const visit = (path, { headers = PAGE_VISIT, method = 'GET' } = {}) =>
	new NextRequest(`${SITE}${path}`, { headers, method })

// What Clerk answers a signed-out visitor of a dashboard page.
function signInRedirect(
	path,
	{ signInPage = `${SITE}/sign-in`, status = 'signed-out', comeBack = `${SITE}${path}` } = {}
) {
	const location = new URL(signInPage)
	location.searchParams.set('redirect_url', comeBack)
	return NextResponse.redirect(location, {
		headers: { 'x-clerk-auth-status': status, 'x-clerk-redirect-to': 'true' },
	})
}

async function answerOf(request, answer) {
	clerk.answer = answer
	const before = answer?.headers.get('location')
	const response = await proxy(request, {})
	// never another response than Clerk's
	expect(response).toBe(answer)
	return { location: response?.headers.get('location'), before }
}

const topLevel = location => Object.fromEntries(new URL(location).searchParams)

beforeEach(() => {
	clerk.answer = undefined
	clerk.auth = Object.assign(vi.fn(), { protect: vi.fn() })
})

describe('campaign parameters on the sign-in redirect', () => {
	it('repeats the utm_* of a signed-out visitor next to redirect_url', async () => {
		const { location, before } = await answerOf(visit(PLUGIN_LINK), signInRedirect(PLUGIN_LINK))

		expect(location).toBe(
			`${before}&utm_source=wordpress-plugin&utm_medium=plugin&utm_campaign=1.1.43&utm_content=credits`
		)
		expect(topLevel(location)).toEqual({
			redirect_url: `${SITE}${PLUGIN_LINK}`,
			utm_source: 'wordpress-plugin',
			utm_medium: 'plugin',
			utm_campaign: '1.1.43',
			utm_content: 'credits',
		})
	})

	it('keeps the status and the other headers of the redirect', async () => {
		const answer = signInRedirect(PLUGIN_LINK)
		await answerOf(visit(PLUGIN_LINK), answer)

		expect(answer.status).toBe(307)
		expect(answer.headers.get('x-clerk-auth-status')).toBe('signed-out')
		expect(answer.headers.get('x-clerk-redirect-to')).toBe('true')
	})

	it.each(['/app?utm_source=doc', '/app/tokens?utm_medium=referral', '/APP/Playground?utm_term=alt-text'])(
		'does it on every dashboard page: %s',
		async path => {
			const { location, before } = await answerOf(visit(path), signInRedirect(path))

			expect(location).toBe(`${before}&${path.split('?')[1]}`)
		}
	)

	it('leaves the protection to auth.protect(), called once, and asks Clerk nothing else', async () => {
		await answerOf(visit(PLUGIN_LINK), signInRedirect(PLUGIN_LINK))

		expect(clerk.auth.protect).toHaveBeenCalledOnce()
		expect(clerk.auth.protect).toHaveBeenCalledWith()
		expect(clerk.auth).not.toHaveBeenCalled()
	})
})

describe('everything else stays as Clerk answered it', () => {
	it('a signed-out visitor without utm_*', async () => {
		const path = '/app/plans?plan=growth&ref=utm_source'
		const { location, before } = await answerOf(visit(path), signInRedirect(path))

		expect(location).toBe(before)
		expect(clerk.auth.protect).toHaveBeenCalledOnce()
	})

	it('a signed-in visitor: no redirect, the page is served', async () => {
		const answer = NextResponse.next()
		const { location } = await answerOf(visit(PLUGIN_LINK), answer)

		expect(location).toBeNull()
		expect(answer.status).toBe(200)
		expect(clerk.auth.protect).toHaveBeenCalledOnce()
	})

	it.each(['POST', 'PUT', 'DELETE', 'HEAD'])('a %s request, even when Clerk redirects it', async method => {
		const { location, before } = await answerOf(visit(PLUGIN_LINK, { method }), signInRedirect(PLUGIN_LINK))

		expect(location).toBe(before)
		expect(clerk.auth.protect).toHaveBeenCalledOnce()
	})

	it.each([
		['a fetch for JSON', { accept: 'application/json' }],
		['a fetch for anything', { accept: '*/*' }],
		['a client-side navigation', { accept: '*/*', 'next-url': '/', rsc: '1' }],
		['a request that says nothing', {}],
	])('%s, even when Clerk redirects it', async (_label, headers) => {
		const { location, before } = await answerOf(visit(PLUGIN_LINK, { headers }), signInRedirect(PLUGIN_LINK))

		expect(location).toBe(before)
		expect(clerk.auth.protect).toHaveBeenCalledOnce()
	})

	it.each([
		['a server action refused with a 401', () => new NextResponse(null, { status: 401 })],
		['an API-like request sent to the not-found page', () => NextResponse.rewrite(`${SITE}/clerk_1`)],
	])('%s', async (_label, refusal) => {
		const answer = refusal()
		answer.headers.set('x-clerk-auth-status', 'signed-out')
		const headers = Object.fromEntries(answer.headers)
		const { location } = await answerOf(visit(PLUGIN_LINK), answer)

		expect(location).toBeNull()
		expect(Object.fromEntries(answer.headers)).toEqual(headers)
		expect(clerk.auth.protect).toHaveBeenCalledOnce()
	})

	it('a handshake, even one served from our own origin', async () => {
		const handshake = { signInPage: `${SITE}/__clerk/v1/client/handshake`, status: 'handshake' }
		const { location, before } = await answerOf(visit(PLUGIN_LINK), signInRedirect(PLUGIN_LINK, handshake))

		expect(location).toBe(before)
	})

	it('a redirect that does not say the visitor is signed out', async () => {
		const answer = signInRedirect(PLUGIN_LINK)
		answer.headers.delete('x-clerk-auth-status')
		const { location, before } = await answerOf(visit(PLUGIN_LINK), answer)

		expect(location).toBe(before)
	})

	it("a sign-in page on Clerk's account portal", async () => {
		const portal = { signInPage: 'https://accounts.forvoyez.com/sign-in' }
		const { location, before } = await answerOf(visit(PLUGIN_LINK), signInRedirect(PLUGIN_LINK, portal))

		expect(location).toBe(before)
	})

	it.each([
		['another origin', 'https://evil.example/app/plans?utm_source=wordpress-plugin'],
		['a lookalike origin', 'https://forvoyez.com.evil.example/app?utm_source=wordpress-plugin'],
		['another scheme', 'http://forvoyez.com/app?utm_source=wordpress-plugin'],
		['another port', 'https://forvoyez.com:8443/app?utm_source=wordpress-plugin'],
		['a relative address', '/app/plans?utm_source=wordpress-plugin'],
		['a protocol-relative address', '//evil.example/app?utm_source=wordpress-plugin'],
		['a script', 'javascript:alert(1)//?utm_source=wordpress-plugin'],
		['nothing', ''],
	])('a redirect whose return address is %s', async (_label, comeBack) => {
		const { location, before } = await answerOf(visit(PLUGIN_LINK), signInRedirect(PLUGIN_LINK, { comeBack }))

		expect(location).toBe(before)
	})

	it('a redirect without redirect_url, or with a location that is not a URL', async () => {
		const bare = NextResponse.redirect(`${SITE}/sign-in?utm_source=kept`, {
			headers: { 'x-clerk-auth-status': 'signed-out' },
		})
		expect((await answerOf(visit(PLUGIN_LINK), bare)).location).toBe(`${SITE}/sign-in?utm_source=kept`)

		const relative = new NextResponse(null, {
			headers: { 'x-clerk-auth-status': 'signed-out', location: '/sign-in?redirect_url=%2Fapp' },
			status: 307,
		})
		expect((await answerOf(visit(PLUGIN_LINK), relative)).location).toBe('/sign-in?redirect_url=%2Fapp')
	})

	it('no answer at all', async () => {
		await expect(proxy(visit(PLUGIN_LINK), {})).resolves.toBeUndefined()
	})

	it('a redirect whose headers cannot be changed: the visitor still reaches the sign-in page', async () => {
		const headers = new Headers({
			location: `${SITE}/sign-in?redirect_url=${encodeURIComponent(`${SITE}${PLUGIN_LINK}`)}`,
			'x-clerk-auth-status': 'signed-out',
		})
		const set = vi.fn(() => {
			throw new TypeError('immutable')
		})
		const { location, before } = await answerOf(visit(PLUGIN_LINK), {
			headers: { get: name => headers.get(name), set },
			status: 307,
		})

		expect(set).toHaveBeenCalledOnce()
		expect(location).toBe(before)
	})
})

describe('public pages', () => {
	it.each([
		'/app/legals?utm_source=wordpress-plugin',
		'/app/legals/terms?utm_source=wordpress-plugin',
		'/App/Legals/privacy-policy?utm_source=wordpress-plugin',
	])('%s stays public and untouched, whatever Clerk answers', async path => {
		const { location, before } = await answerOf(visit(path), signInRedirect(path))

		expect(location).toBe(before)
		expect(clerk.auth.protect).not.toHaveBeenCalled()
	})

	it.each(['/?utm_source=wordpress-plugin', '/wordpress-plugin?utm_source=doc', '/sign-in?utm_source=doc'])(
		'%s is not protected and its answer is untouched',
		async path => {
			const { location, before } = await answerOf(visit(path), signInRedirect(path))

			expect(location).toBe(before)
			expect(clerk.auth.protect).not.toHaveBeenCalled()
		}
	)

	it('serves the legal documents to a campaign visitor', async () => {
		const answer = NextResponse.next()
		const { location } = await answerOf(visit('/app/legals/terms?utm_source=wordpress-plugin'), answer)

		expect(location).toBeNull()
		expect(answer.status).toBe(200)
	})
})

describe('what is copied', () => {
	const copied = async query => {
		const path = `/app?${query}`
		const { location } = await answerOf(visit(path), signInRedirect(path))
		const { redirect_url: comeBack, ...others } = topLevel(location)
		// the return address is never rewritten, whatever was in the link
		expect(comeBack).toBe(`${SITE}${path}`)
		return others
	}

	it.each([
		['a tag', 'utm_source=%3Cscript%3Ealert(1)%3C%2Fscript%3E'],
		['a URL', 'utm_source=https%3A%2F%2Fevil.example%2F'],
		['a protocol-relative URL', 'utm_source=%2F%2Fevil.example'],
		['a line break', 'utm_source=wordpress%0D%0ASet-Cookie%3A%20a%3Db'],
		['a space', 'utm_source=wordpress+plugin'],
		['an email address', 'utm_source=jane%40example.com'],
		['an ampersand', 'utm_source=a%26redirect_url%3Dhttps%3A%2F%2Fevil.example'],
		['a quote', 'utm_source=%22onload%3D'],
		['a percent sign', 'utm_source=100%25'],
		['a non-ASCII letter', 'utm_source=caf%C3%A9'],
		['a null byte', 'utm_source=wp%00'],
		['101 characters', `utm_source=${'a'.repeat(101)}`],
		['nothing', 'utm_source='],
		['no value', 'utm_source'],
	])('drops a value with %s', async (_label, query) => {
		expect(await copied(query)).toEqual({})
	})

	it.each([
		['an upper-case key', 'UTM_SOURCE=doc'],
		['a mixed-case key', 'Utm_Source=doc'],
		['a key with a digit', 'utm_source2=doc'],
		['a key with brackets', 'utm_source%5B%5D=doc'],
		['a key with a dash', 'utm-source=doc'],
		['a bare prefix', 'utm_=doc'],
		['a key of 21 letters after the prefix', `utm_${'a'.repeat(21)}=doc`],
		['a key that only contains utm_', 'xutm_source=doc'],
		['a return address', 'redirect_url=https%3A%2F%2Fevil.example%2F'],
		["Clerk's own parameters", 'sign_in_force_redirect_url=https%3A%2F%2Fevil.example&__clerk_db_jwt=x'],
		['anything personal', 'email=jane%40example.com&name=Jane&plan=growth'],
	])('ignores %s', async (_label, query) => {
		expect(await copied(query)).toEqual({})
	})

	it('keeps the valid parameters of a link that also carries hostile ones', async () => {
		const query = [
			'utm_source=wordpress-plugin',
			'utm_medium=%3Cimg%20src%3Dx%3E',
			'utm_campaign=1.1.43',
			'redirect_url=https%3A%2F%2Fevil.example%2F',
			'utm_content=settings_page~top',
			'email=jane%40example.com',
		].join('&')

		expect(await copied(query)).toEqual({
			utm_source: 'wordpress-plugin',
			utm_campaign: '1.1.43',
			utm_content: 'settings_page~top',
		})
	})

	it('accepts the longest key and value', async () => {
		const key = `utm_${'a'.repeat(20)}`
		const value = 'A'.repeat(100)

		expect(await copied(`${key}=${value}`)).toEqual({ [key]: value })
	})

	it('copies the first valid value of a repeated key', async () => {
		expect(await copied('utm_source=%3Cb%3E&utm_source=doc&utm_source=wordpress-plugin')).toEqual({
			utm_source: 'doc',
		})
	})

	it('never replaces a parameter the sign-in page already has', async () => {
		const path = '/app?utm_source=wordpress-plugin&utm_medium=plugin'
		const signInPage = `${SITE}/sign-in?utm_source=configured`
		const { location } = await answerOf(visit(path), signInRedirect(path, { signInPage }))

		expect(topLevel(location)).toEqual({
			utm_source: 'configured',
			redirect_url: `${SITE}${path}`,
			utm_medium: 'plugin',
		})
	})

	it('leaves a single return address, on our own origin', async () => {
		const path = '/app?utm_source=doc&redirect_url=https%3A%2F%2Fevil.example%2F'
		const { location } = await answerOf(visit(path), signInRedirect(path))
		const signIn = new URL(location)

		expect(signIn.origin).toBe(SITE)
		expect(signIn.pathname).toBe('/sign-in')
		expect(signIn.searchParams.getAll('redirect_url')).toEqual([`${SITE}${path}`])
		expect(new URL(signIn.searchParams.get('redirect_url')).origin).toBe(SITE)
	})
})
