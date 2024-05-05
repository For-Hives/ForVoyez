'use server'

import { auth } from '@clerk/nextjs'
import { prisma } from '@/services/prisma.service'
import { generateJwt } from '@/services/jwt.service'

function truncateToken(token) {
	if (!token) return ''
	// 	slice, and return the first 5 characters of the token string, then append '...', terminating the string with the 5 last characters.
	return token.slice(0, 5) + '-...-' + token.slice(-5)
}

export async function createToken(token) {
	const { userId } = auth()

	if (!userId) {
		throw new Error('You must be logged in to create a token')
	}

	console.log(userId)

	let jwt = await generateJwt({
		userId: userId,
		createdAt: token.createdAt,
		expiredAt: token.expiredAt,
		name: token.name,
	})

	let jwt_shortened = truncateToken(jwt)

	const result = await prisma.token.create({
		data: {
			userId: userId,
			jwt: jwt,
			createdAt: token.createdAt,
			expiredAt: token.expiredAt,
			name: token.name,
		},
	})

	return { ...result, jwt, jwt_shortened }
}

export async function getAllToken() {
	const { userId } = auth()

	if (!userId) {
		throw new Error('You must be logged in to view tokens')
	}

	const result = await prisma.token.findMany({
		where: {
			userId: userId,
		},
	})

	console.log('views all tokens', result)

	return result.map(token => ({
		...token,
		jwt: truncateToken(token.jwt),
	}))
}

export async function deleteToken(tokenId) {
	const { userId } = auth()

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

	const result = await prisma.token.delete({
		where: {
			id: tokenId,
		},
	})

	return result
}
