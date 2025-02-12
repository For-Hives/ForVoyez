'use server'

import { currentUser } from '@clerk/nextjs/server'

import { generateJwt } from '@/services/jwt.service'
import { prisma } from '@/services/prisma.service'

export async function createToken(token) {
	const userId = (await currentUser())?.id

	if (!userId) {
		throw new Error('You must be logged in to create a token')
	}

	let jwt = await generateJwt({
		createdAt: token.createdAt,
		expiredAt: token.expiredAt,
		name: token.name,
		userId: userId,
	})

	let jwt_shortened = truncateToken(jwt)

	const result = await prisma.token.create({
		data: {
			createdAt: token.createdAt,
			expiredAt: token.expiredAt,
			name: token.name,
			userId: userId,
			jwt: jwt,
		},
	})

	return { ...result, jwt_shortened }
}

export async function deleteToken(tokenId) {
	const userId = (await currentUser())?.id

	if (!userId) {
		throw new Error('You must be logged in to delete a token')
	}

	const token = await prisma.token.findUnique({
		where: {
			id: tokenId,
		},
	})

	if (!token || token.userId !== userId) {
		throw new Error('You do not have permission to delete this token')
	}

	return await prisma.token.delete({
		where: {
			id: tokenId,
		},
	})
}

export async function getAllToken() {
	const userId = (await currentUser())?.id

	if (!userId) {
		throw new Error('You must be logged in to view tokens')
	}

	const result = await prisma.token.findMany({
		where: {
			userId: userId,
		},
	})

	return result.map(token => ({
		...token,
		jwt: truncateToken(token.jwt),
	}))
}

function truncateToken(token) {
	if (!token) return ''
	// 	slice, and return the first 5 characters of the token string, then append '...', terminating the string with the 5 last characters.
	return token.slice(0, 5) + '*****' + token.slice(-5)
}
