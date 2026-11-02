'use server'

import { auth } from '@clerk/nextjs/server'

import { parseTokenInput, requireTokenId } from '@/helpers/tokenInput'
import { generateJwt } from '@/services/jwt.service'
import { prisma } from '@/services/prisma.service'

// Far above what one account needs (one key per site), and each one is a row
// that a free account could otherwise add without limit.
const MAX_TOKENS_PER_USER = 100

export async function createToken(input) {
	const userId = (await auth()).userId

	if (!userId) {
		throw new Error('You must be logged in to create a token')
	}

	const token = parseTokenInput(input)

	if ((await prisma.token.count({ where: { userId } })) >= MAX_TOKENS_PER_USER) {
		throw new Error(`You can have at most ${MAX_TOKENS_PER_USER} API keys, delete one first`)
	}

	const jwt = await generateJwt({
		createdAt: token.createdAt,
		expiredAt: token.expiredAt,
		name: token.name,
		userId: userId,
	})

	const jwt_shortened = truncateToken(jwt)

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
	const userId = (await auth()).userId

	if (!userId) {
		throw new Error('You must be logged in to delete a token')
	}

	requireTokenId(tokenId)

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
			userId,
			id: tokenId,
		},
	})
}

export async function getAllToken() {
	const userId = (await auth()).userId

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
	return `${token.slice(0, 5)}*****${token.slice(-5)}`
}
