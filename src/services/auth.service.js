import { auth } from '@clerk/nextjs/server'

import 'server-only'

// Returns the signed-in Clerk user id, or throws when the request is anonymous.
// `auth()` reads the session verified by the Clerk proxy: no network call.
export async function requireUserId() {
	const { userId } = await auth()

	if (!userId) {
		throw new Error('Unauthorized')
	}

	return userId
}
