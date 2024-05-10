'use server'

import { currentUser } from '@clerk/nextjs/server'

import { prisma } from '@/services/prisma.service'

export async function createUser() {
	const user = await currentUser()

	if (!user.id) {
		throw new Error('You must be logged to create a user')
	}

	// todo : verfier que la table user a bien ete initialiser

	// check if a user already exist with the same clerkId
	const userDB = await prisma.user.findUnique({
		where: {
			clerkId: user.id,
		},
	})

	if (userDB) {
		return userDB
	}

	const result = await prisma.user.create({
		data: {
			clerkId: userId,
			updatedAt: new Date().toISOString(),
		},
	})

	return result
}
