import { SignJWT, jwtVerify } from 'jose'
import { createSecretKey } from 'crypto'

function generateSecretKey() {
	return createSecretKey(process.env.JWT_SECRET, 'utf-8')
}

export async function generateJwt(payload) {
	const secretKey = generateSecretKey()

	// secretKey generated from previous step
	return await new SignJWT(payload)

		// details to  encode in the token
		.setProtectedHeader({
			alg: 'HS256',
		}) // algorithm
		.setIssuedAt()
		.setIssuer('ForVoyez') // issuer
		.setAudience('ForVoyez') // audience
		.setExpirationTime(new Date(payload.expiredAt)) // token expiration time
		// toISOString
		.sign(secretKey)
}

export async function verifyJwt(jwt) {
	const secretKey = generateSecretKey()
	// extract token from request
	const token = jwt.replace('Bearer ', '')
	try {
		// verify token
		const { payload } = await jwtVerify(token, secretKey, {
			audience: 'ForVoyez', // audience
			issuer: 'ForVoyez', // issuer
		})

		return payload
	} catch (e) {
		throw new Error('Token is not signed by the server')
	}
}
