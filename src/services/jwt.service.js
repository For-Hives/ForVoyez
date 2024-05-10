import { createSecretKey } from 'crypto'

import { jwtVerify, SignJWT } from 'jose'

function generateSecretKey() {
	return createSecretKey(process.env.JWT_SECRET, 'utf-8')
}

export async function generateJwt(payload) {
	const secretKey = generateSecretKey()

	const token = await new SignJWT(payload)

		// details to  encode in the token
		.setProtectedHeader({
			alg: 'HS256',
		}) // algorithm
		.setIssuedAt()
		.setIssuer('ForVoyez') // issuer
		.setAudience('ForVoyez') // audience
		.setExpirationTime('1 day') // token expiration time, e.g., "1 day" // todo : change to Date()
		// toISOString
		.sign(secretKey) // secretKey generated from previous step

	return token
}

export async function verifyJwt(jwt) {
	const secretKey = generateSecretKey()
	// extract token from request
	const token = jwt.replace('Bearer ', '')
	try {
		// verify token
		const { payload, protectedHeader } = await jwtVerify(token, secretKey, {
			issuer: 'ForVoyez', // issuer
			audience: 'ForVoyez', // audience
		})

		return payload
	} catch (e) {
		console.error(e)

		throw new Error('Token is invalid')
	}
}

export function formatJwt(jwt) {
	const token = jwt.slice(0, 5) + '-...-' + jwt.slice(-5)

	return token
}
