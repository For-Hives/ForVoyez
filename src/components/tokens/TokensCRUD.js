'use server'

import { auth } from '@clerk/nextjs'
import { prisma } from '@/services/prisma.service'

export async function createToken(token) {
	'use server'

	const { userId } = auth()

	if (!userId) {
		throw new Error('You must be logged to create a token')
	}

	console.log(userId)

	// todo : verfier que la table user a bien ete initialiser

	console.log(token)

	const result = await prisma.token.create({
		data: {
			userId: userId,
			createdAt: token.createdAt,
			expiredAt: token.expiredAt,
			name: token.name,
		},
	})

	return result
}
