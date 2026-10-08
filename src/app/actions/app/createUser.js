'use server'

import { auth } from '@clerk/nextjs/server'

import { prisma } from '@/services/prisma.service'

export async function createUser() {
	// the session the Clerk proxy verified: no call to the Clerk API
	const { userId } = await auth()

	if (!userId) {
		throw new Error('You must be logged to create a user')
	}

	// check if a user already exist with the same clerkId
	const userDB = await prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
	})

	if (userDB) {
		return userDB
	}

	return await prisma.user.create({
		data: {
			updatedAt: new Date().toISOString(),
			clerkId: userId,
		},
	})
}
