import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/tokens/route'

import { verifyJwt } from '@/services/jwt.service'

import { prisma } from '/tests/unit/mocks/prisma.mock'

// The real database.service runs against the mocked Prisma client, so these
// tests also cover the API key lookup shared with /api/describe.
vi.mock('@/services/jwt.service')
vi.mock('@clerk/nextjs/server')
vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})

const JWT = 'header.payload.signature-of-the-api-key'

const createdAt = new Date('2026-01-01T00:00:00.000Z')
const expiredAt = new Date(Date.now() + 24 * 3600 * 1000)
const registeredAt = new Date('2025-06-01T00:00:00.000Z')

const tokenRow = {
	userId: 'user_a',
	name: 'my-site',
	id: 'token-1',
	expiredAt,
	createdAt,
	jwt: JWT,
}

const userRow = {
	createdAt: registeredAt,
	clerkId: 'user_a',
	Subscription: [],
	credits: 42,
}

function request(authorization = `Bearer ${JWT}`) {
	return new Request('http://localhost/api/tokens', {
		headers: authorization ? { Authorization: authorization } : {},
	})
}

describe('GET /api/tokens', () => {
	let consoleError

	beforeEach(() => {
		vi.resetAllMocks()
		consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		verifyJwt.mockResolvedValue({ userId: 'user_a' })
		prisma.token.findUnique.mockResolvedValue(tokenRow)
		prisma.user.findFirst.mockResolvedValue(userRow)
	})

	afterEach(() => {
		// the API key is a credential: never logged
		const logged = consoleError.mock.calls
			.flat()
			.map(argument => String(argument?.message ?? argument))
			.join('\n')
		expect(logged).not.toContain(JWT)
		consoleError.mockRestore()
	})

	it('returns the account of a valid API key, in the same shape as before', async () => {
		const response = await GET(request())

		expect(response.status).toBe(200)
		expect(prisma.token.findUnique).toHaveBeenCalledWith({
			where: { jwt: JWT },
		})
		expect(await response.json()).toEqual({
			user: {
				registeredAt: registeredAt.toISOString(),
				email: 'Not available',
				name: 'my-site',
				id: 'user_a',
				credits: 42,
			},
			token: {
				createdAt: createdAt.toISOString(),
				expiredAt: expiredAt.toISOString(),
				name: 'my-site',
			},
			subscription: { isSubscribed: false },
			success: true,
		})
	})

	it('returns the active subscription with the account', async () => {
		prisma.user.findFirst.mockResolvedValue({
			...userRow,
			Subscription: [
				{
					plan: { description: 'Monthly plan', name: 'Starter' },
					renewsAt: '2026-11-08T00:00:00.000000Z',
					statusFormatted: 'Active',
					status: 'active',
					endsAt: null,
				},
			],
		})

		const response = await GET(request())

		expect((await response.json()).subscription).toEqual({
			plan: { description: 'Monthly plan', name: 'Starter' },
			renewsAt: '2026-11-08T00:00:00.000000Z',
			statusFormatted: 'Active',
			isSubscribed: true,
			status: 'active',
			endsAt: null,
		})
	})

	it.each([
		['was deleted from the dashboard', null],
		['belongs to another user', { ...tokenRow, userId: 'user_b' }],
		[
			'is expired in the database',
			{ ...tokenRow, expiredAt: new Date(Date.now() - 1000) },
		],
	])(
		'answers the same 401 JSON as /api/describe when the API key %s',
		async (_case, row) => {
			prisma.token.findUnique.mockResolvedValue(row)

			const response = await GET(request())

			expect(response.status).toBe(401)
			expect(response.headers.get('Content-Type')).toContain('application/json')
			expect(await response.json()).toEqual({
				error: 'Unauthorized, invalid token',
			})
			// nothing about the JWT's user (or the row's) is returned
			expect(prisma.user.findFirst).not.toHaveBeenCalled()
		}
	)

	it('answers 401 JSON when the signature is invalid', async () => {
		verifyJwt.mockRejectedValue(new Error('Token is not signed by the server'))

		const response = await GET(request())

		expect(response.status).toBe(401)
		expect(await response.json()).toEqual({
			error: 'Invalid or expired token',
		})
		expect(prisma.token.findUnique).not.toHaveBeenCalled()
	})

	it('answers 401 JSON without an Authorization header', async () => {
		const response = await GET(request(null))

		expect(response.status).toBe(401)
		expect(await response.json()).toEqual({
			error: 'Missing or invalid authentication token',
		})
	})
})
