'use server'

import { currentUser } from '@clerk/nextjs/server'

import { prisma } from '@/services/prisma.service'

export async function createUser() {
	const user = await currentUser()

	if (!user || !user.id) {
		throw new Error('You must be logged to create a user')
	}

	// check if a user already exist with the same clerkId
	const userDB = await prisma.user.findUnique({
		where: {
			clerkId: user.id,
		},
	})

	if (userDB) {
		return userDB
	}

	return await prisma.user.create({
		data: {
			updatedAt: new Date().toISOString(),
			clerkId: user.id,
		},
	})
}
