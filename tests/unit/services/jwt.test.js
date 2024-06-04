import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignJWT, jwtVerify } from 'jose'
import { createSecretKey } from 'crypto'

import { generateJwt, verifyJwt } from '@/services/jwt.service'

vi.mock('jose')
vi.mock('crypto')

describe('JWT Service', () => {
	const expiredAt = new Date()
	const payload = { expiredAt: expiredAt, name: 'Test User', id: 1 }

	const token = 'mocked.jwt.token'
	const secret = 'mysecret'

	beforeEach(() => {
		process.env.JWT_SECRET = secret
		createSecretKey.mockReturnValue(secret)
	})

	describe('generateJwt', () => {
		it('should generate a JWT token', async () => {
			SignJWT.prototype.setProtectedHeader = vi.fn().mockReturnThis()
			SignJWT.prototype.setIssuedAt = vi.fn().mockReturnThis()
			SignJWT.prototype.setIssuer = vi.fn().mockReturnThis()
			SignJWT.prototype.setAudience = vi.fn().mockReturnThis()
			SignJWT.prototype.setExpirationTime = vi.fn().mockReturnThis()
			SignJWT.prototype.sign = vi.fn().mockResolvedValue(token)

			const generatedToken = await generateJwt(payload)

			expect(SignJWT.prototype.setProtectedHeader).toHaveBeenCalledWith({
				alg: 'HS256',
			})
			expect(SignJWT.prototype.setIssuer).toHaveBeenCalledWith('ForVoyez')
			expect(SignJWT.prototype.setAudience).toHaveBeenCalledWith('ForVoyez')
			expect(SignJWT.prototype.setExpirationTime).toHaveBeenCalledWith(
				expiredAt
			)
			expect(SignJWT.prototype.sign).toHaveBeenCalledWith(secret)
			expect(generatedToken).toBe(token)
		})
	})

	describe('verifyJwt', () => {
		it('should verify a valid JWT token', async () => {
			jwtVerify.mockResolvedValue({ payload })

			const verifiedPayload = await verifyJwt(`Bearer ${token}`)

			expect(jwtVerify).toHaveBeenCalledWith(token, secret, {
				audience: 'ForVoyez',
				issuer: 'ForVoyez',
			})
			expect(verifiedPayload).toEqual(payload)
		})

		it('should throw an error for an invalid JWT token', async () => {
			jwtVerify.mockRejectedValue(new Error('Token is invalid'))

			await expect(verifyJwt(`Bearer ${token}`)).rejects.toThrow(
				'Token is invalid'
			)
		})
	})
})
