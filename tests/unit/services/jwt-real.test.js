// @vitest-environment node
import { createSecretKey } from 'node:crypto'
import { SignJWT } from 'jose'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generateJwt, verifyJwt } from '@/services/jwt.service'

const secret = 'test-only-secret-with-at-least-32-bytes'
const now = new Date('2026-10-09T12:00:00Z')
const timestamp = now.getTime() / 1000

function signed({
	algorithm = 'HS256',
	issuer = 'ForVoyez',
	audience = 'ForVoyez',
	expiration = timestamp + 60,
	key = secret,
	notBefore,
} = {}) {
	let token = new SignJWT({ userId: 'owner' })
		.setProtectedHeader({ alg: algorithm })
		.setIssuer(issuer)
		.setAudience(audience)
		.setExpirationTime(expiration)
	if (notBefore !== undefined) token = token.setNotBefore(notBefore)
	return token.sign(createSecretKey(key))
}

describe('JWT with real cryptographic verification', () => {
	beforeEach(() => {
		vi.stubEnv('JWT_SECRET', secret)
		vi.useFakeTimers()
		vi.setSystemTime(now)
	})
	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllEnvs()
	})

	it('round trips the real generator and accepts the optional Bearer prefix', async () => {
		const jwt = await generateJwt({ userId: 'owner', expiredAt: new Date(now.getTime() + 60000) })
		expect(await verifyJwt(jwt)).toMatchObject({
			userId: 'owner',
			iss: 'ForVoyez',
			aud: 'ForVoyez',
			exp: timestamp + 60,
		})
		expect(await verifyJwt(`Bearer ${jwt}`)).toMatchObject({ userId: 'owner' })
	})

	it.each([
		{ algorithm: 'HS384' },
		{ issuer: 'other' },
		{ audience: 'other' },
		{ key: 'a-different-test-secret-at-least-32-bytes' },
		{ expiration: timestamp },
		{ expiration: timestamp - 1 },
		{ notBefore: timestamp + 1 },
	])('rejects invalid cryptographic claims %j', async options => {
		await expect(verifyJwt(await signed(options))).rejects.toThrow('Token is not signed by the server')
	})

	it('accepts expiration one second ahead and an active not-before claim', async () => {
		expect(await verifyJwt(await signed({ expiration: timestamp + 1, notBefore: timestamp }))).toMatchObject({
			userId: 'owner',
		})
	})

	it.each([undefined, null, false, 0, {}, [], '', 'Bearer ', 'invalid.jwt', 'prefix Bearer invalid'])(
		'rejects malformed input %j',
		async input => {
			await expect(verifyJwt(input)).rejects.toThrow('Token is not signed by the server')
		}
	)

	it('rejects a tampered payload', async () => {
		const token = await signed()
		const [header, , signature] = token.split('.')
		const payload = Buffer.from(JSON.stringify({ userId: 'attacker' })).toString('base64url')
		await expect(verifyJwt(`${header}.${payload}.${signature}`)).rejects.toThrow('Token is not signed by the server')
	})
})
