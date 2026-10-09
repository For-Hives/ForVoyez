import { clerkMiddleware } from '@clerk/nextjs/server'

// Preserve the case-insensitive prefix matching of the former Clerk route matcher.
const PROTECTED_ROUTE = /^\/app/i
const LEGAL_ROUTE = /^\/app\/legals/i

const isProtectedRoute = req => PROTECTED_ROUTE.test(req.nextUrl.pathname)
const isLegals = req => LEGAL_ROUTE.test(req.nextUrl.pathname)

export default clerkMiddleware(async (auth, req) => {
	if (isLegals(req)) return
	if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
	// Pages and their server actions (POSTs to the page URL) go through Clerk.
	// Skipped: static assets, `_next` and the public API (`/api/*`). The API
	// routes authenticate with their own HS256 API keys, the Lemon Squeezy
	// HMAC or a shared secret, and never call Clerk: running Clerk there only
	// made it try to verify our API keys as Clerk session tokens (a JWKS fetch
	// on every request, 2-4 s when Clerk is slow or unreachable).
	matcher: ['/((?!api/|api$|.*\\..*|_next).*)', '/', '/trpc(.*)'],
}
