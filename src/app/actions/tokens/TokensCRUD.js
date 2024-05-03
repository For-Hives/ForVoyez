'use server'

import { auth } from '@clerk/nextjs'
import { prisma } from '@/services/prisma.service'
import { generateJwt } from '@/services/jwt.service'

export async function createToken(token) {
	const { userId } = auth()

	if (!userId) {
		throw new Error('You must be logged to create a token')
	}

	console.log(userId)

	let jwt = await generateJwt({
		userId: userId,
		createdAt: token.createdAt,
		expiredAt: token.expiredAt,
		name: token.name,
	})

	// todo : verfier que la table user a bien ete initialiser
	const result = await prisma.token.create({
		data: {
			userId: userId,
			jwt: jwt,
			createdAt: token.createdAt,
			expiredAt: token.expiredAt,
			name: token.name,
		},
	})

	return result
}

export async function getAllToken() {
	const { userId } = auth()

	if (!userId) {
		throw new Error('You must be logged to view a token')
	}

	const result = await prisma.token.findMany({
		where: {
			userId: userId,
		},
	})

	console.log('views all token ', result)

	return result
}

export async function deleteToken(tokenId) {
	const { userId } = auth()

	if (!userId) {
		throw new Error('You must be logged in to delete a token')
	}

	// Check if the user owns the token
	const token = await prisma.token.findUnique({
		where: {
			id: tokenId,
		},
	})

	if (!token || token.userId !== userId) {
		throw new Error('You do not have permission to delete this token')
	}

	const result = await prisma.token.delete({
		where: {
			id: tokenId,
		},
	})

	return result
}
