import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// publicRoutes: ['/', '/contact', '/api(.*)'],

const isProtectedRoute = createRouteMatcher(['/app(.*)'])
const isLegals = createRouteMatcher(['/app/legals(.*)'])

export default clerkMiddleware((auth, req) => {
	if (isLegals(req)) return
	if (isProtectedRoute(req)) auth().protect()
})

export const config = {
	// The following matcher runs middleware on all routes
	// except static assets.
	matcher: ['/((?!.*\\..*|_next).*)', '/', '/trpc(.*)'],
}
