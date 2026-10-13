import { clerkMiddleware } from '@clerk/nextjs/server'

// Preserve the case-insensitive prefix matching of the former Clerk route matcher.
const PROTECTED_ROUTE = /^\/app/i
const LEGAL_ROUTE = /^\/app\/legals/i

// Campaign parameters of the links in the WordPress plugin, the docs and the
// wordpress.org listing. A key or a value outside these is discarded whole,
// never cut to fit.
const CAMPAIGN_KEY = /^utm_[a-z_]{1,20}$/
const CAMPAIGN_VALUE = /^[A-Za-z0-9._~-]{1,100}$/

const isProtectedRoute = req => PROTECTED_ROUTE.test(req.nextUrl.pathname)
const isLegals = req => LEGAL_ROUTE.test(req.nextUrl.pathname)

const clerkProxy = clerkMiddleware(async (auth, req) => {
	if (isLegals(req)) return
	if (isProtectedRoute(req)) await auth.protect()
})

// What a browser asks for when it opens a page: not a fetch, not a server action.
const isPageVisit = req => req.method === 'GET' && req.headers.get('accept')?.includes('text/html')

export default async function proxy(request, event) {
	const response = await clerkProxy(request, event)
	if (isPageVisit(request) && isProtectedRoute(request) && !isLegals(request)) showCampaignOnSignIn(response)
	return response
}

// A signed-out visitor who follows a campaign link to the dashboard is sent by
// Clerk to <sign-in page>?redirect_url=<page asked for>: the utm_* are buried
// in redirect_url and Umami records that first page view without a source.
// They are repeated next to redirect_url, on the redirect Clerk built: its
// handler API cannot add a parameter to the sign-in URL, and only Clerk knows
// that URL and the public origin behind the reverse proxy.
function showCampaignOnSignIn(response) {
	try {
		// Clerk's own verdict: its handshake redirect carries a redirect_url too.
		if (response?.headers.get('x-clerk-auth-status') !== 'signed-out') return

		const signIn = parseUrl(response.headers.get('location'))
		const comeBack = parseUrl(signIn?.searchParams.get('redirect_url'))
		// Our sign-in page, coming back to our site: not Clerk's account portal
		// (we do not measure it), not a return address on another origin.
		if (!comeBack || comeBack.origin !== signIn.origin) return

		let found = false
		for (const [key, value] of comeBack.searchParams) {
			// the first valid value of a repeated key wins
			if (CAMPAIGN_KEY.test(key) && CAMPAIGN_VALUE.test(value) && !signIn.searchParams.has(key)) {
				signIn.searchParams.set(key, value)
				found = true
			}
		}
		if (found) response.headers.set('location', signIn.href)
	} catch {
		// measuring must never break the redirect to the sign-in page
	}
}

function parseUrl(value) {
	try {
		return new URL(value)
	} catch {
		return null
	}
}

export const config = {
	// Pages and their server actions (POSTs to the page URL) go through Clerk.
	// Skipped: static assets, `_next` and the public API (`/api/*`). The API
	// routes authenticate with their own HS256 API keys, the Lemon Squeezy
	// HMAC or a shared secret, and never call Clerk: running Clerk there only
	// made it try to verify our API keys as Clerk session tokens (a JWKS fetch
	// on every request, 2-4 s when Clerk is slow or unreachable).
	matcher: ['/((?!api/|api$|.*\\..*|_next).*)', '/', '/trpc(.*)'],
}
