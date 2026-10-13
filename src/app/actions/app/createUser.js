'use server'

import { auth } from '@clerk/nextjs/server'

import { createUserIfMissing } from '@/services/ensureUser.service'

// Answers { created } and nothing else of the row: true for the one call that
// inserted the row of this account, false for every later one. The dashboard
// layout reports the true one as a sign-up.
export async function createUser() {
	// the session the Clerk proxy verified: no call to the Clerk API
	const { userId } = await auth()

	if (!userId) {
		throw new Error('You must be logged to create a user')
	}

	const { created } = await createUserIfMissing({ updatedAt: new Date().toISOString(), clerkId: userId })
	return { created }
}
