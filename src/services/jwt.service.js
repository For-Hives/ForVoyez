import { createSecretKey } from 'node:crypto'
import { jwtVerify, SignJWT } from 'jose'

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
	try {
		if (typeof jwt !== 'string' || jwt.length === 0) throw new Error('Invalid token')
		const token = jwt.startsWith('Bearer ') ? jwt.slice(7) : jwt
		const { payload } = await jwtVerify(token, secretKey, {
			algorithms: ['HS256'],
			audience: 'ForVoyez',
			issuer: 'ForVoyez',
		})
		return payload
	} catch {
		throw new Error('Token is not signed by the server')
	}
}

function generateSecretKey() {
	return createSecretKey(process.env.JWT_SECRET, 'utf-8')
}
