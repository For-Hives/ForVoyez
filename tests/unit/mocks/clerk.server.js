// Lightweight mock for @clerk/nextjs/server used in unit tests
// Provide minimal, safe implementations. Tests typically call
// `vi.mock('@clerk/nextjs/server')` and then override these with spies,
// so these are just fallbacks for when tests don't mock.

export function clerkMiddleware() {
	// a no-op middleware placeholder
	return (req, res, next) => next()
}

export function createRouteMatcher() {
	return () => true
}

export async function currentUser() {
	return null
}

export default {
	createRouteMatcher,
	clerkMiddleware,
	currentUser,
}
