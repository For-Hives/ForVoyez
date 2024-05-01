'use server'

import { auth } from '@clerk/nextjs'
import { prisma } from '@/services/prisma.service'

export async function createUser() {
	const { userId } = auth()

	if (!userId) {
		throw new Error('You must be logged to create a user')
	}

	console.log(userId)

	// todo : verfier que la table user a bien ete initialiser

	// check if a user already exist with the same clerkId
	const user = await prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
	})

	if (user) {
		return user
	}

	const result = await prisma.user.create({
		data: {
			clerkId: userId,
			updatedAt: new Date().toISOString(),
		},
	})

	return result
}
