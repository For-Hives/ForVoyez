'use server'

import { auth } from '@clerk/nextjs/server'

import { ensureUser } from '@/services/ensureUser.service'

export async function createUser() {
	// the session the Clerk proxy verified: no call to the Clerk API
	const { userId } = await auth()

	if (!userId) {
		throw new Error('You must be logged to create a user')
	}

	return ensureUser({ updatedAt: new Date().toISOString(), clerkId: userId })
}
