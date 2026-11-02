// How many requests of one account POST /api/describe runs at the same time, with
// real multipart requests and the real sharp. Only the API key check, the database
// and the model are stubbed.
// @vitest-environment node

import sharp from 'sharp'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/describe/route'

import { getImageDescription } from '@/services/imageDescription.service'
import { verifyJwt } from '@/services/jwt.service'

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('@/services/imageDescription.service', async importOriginal => ({
	...(await importOriginal()),
	getImageDescription: vi.fn(),
}))
vi.mock('@/services/jwt.service')
vi.mock('@clerk/nextjs/server')
vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})

const JWT = 'header.payload.signature-of-the-api-key'
const DESCRIPTION = { alternativeText: 'Alt', caption: 'Caption', title: 'T' }

function describeRequest(bytes, type) {
	const body = new FormData()
	body.append('image', new Blob([bytes], { type }), 'upload')
	return new Request('http://localhost/api/describe', {
		headers: { Authorization: `Bearer ${JWT}` },
		method: 'POST',
		body,
	})
}

function image(format) {
	return sharp({ create: { background: '#c0392b', channels: 3, height: 30, width: 40 } })
		[format]()
		.toBuffer()
}

describe('POST /api/describe requests at the same time', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => {})
		verifyJwt.mockResolvedValue({ userId: 'user_a' })
		prisma.token.findUnique.mockResolvedValue({
			expiredAt: new Date(Date.now() + 3600 * 1000),
			userId: 'user_a',
			id: 'token-1',
			jwt: JWT,
		})
		prisma.$transaction.mockImplementation(queries => Promise.all(queries))
		prisma.user.updateMany.mockResolvedValue({ count: 1 })
		getImageDescription.mockResolvedValue(DESCRIPTION)
	})

	const TOO_MANY = {
		error: 'Too many requests at the same time: at most 16 per account, wait for one to end and try again',
	}

	// `count` requests of `userId` stuck in the generation, and how to end them
	async function requestsInProgress(count, userId = 'user_a') {
		let finish
		const finished = new Promise(resolve => {
			finish = resolve
		})
		verifyJwt.mockResolvedValue({ userId })
		prisma.token.findUnique.mockResolvedValue({
			expiredAt: new Date(Date.now() + 3600 * 1000),
			id: 'token-1',
			jwt: JWT,
			userId,
		})
		prisma.user.findUnique.mockReset().mockImplementation(() => ({ clerkId: userId, credits: 100 }))
		let started = 0
		let allStarted
		const generating = new Promise(resolve => {
			allStarted = resolve
		})
		getImageDescription.mockImplementation(async () => {
			started += 1
			if (started === count) allStarted()
			await finished
			return DESCRIPTION
		})
		const bytes = await image('png')
		const responses = Array.from({ length: count }, () => POST(describeRequest(bytes, 'image/png')))
		await generating
		return {
			bytes,
			end: async () => {
				finish()
				return await Promise.all(responses)
			},
		}
	}

	it('answers 429 over the limit of one account, before reading the body, and frees the slots', async () => {
		const running = await requestsInProgress(16)
		const chargedSoFar = prisma.user.updateMany.mock.calls.length
		const request = describeRequest(running.bytes, 'image/png')
		const readBody = vi.spyOn(request, 'formData')

		const refused = await POST(request)

		expect(refused.status).toBe(429)
		expect(await refused.json()).toEqual(TOO_MANY)
		expect(readBody).not.toHaveBeenCalled()
		expect(prisma.user.updateMany).toHaveBeenCalledTimes(chargedSoFar)

		for (const response of await running.end()) {
			expect(response.status).toBe(200)
		}
		expect((await POST(describeRequest(running.bytes, 'image/png'))).status).toBe(200)
	}, 60_000)

	it('does not let one account use up the slots of another', async () => {
		const running = await requestsInProgress(16)

		verifyJwt.mockResolvedValue({ userId: 'user_b' })
		prisma.token.findUnique.mockResolvedValue({
			expiredAt: new Date(Date.now() + 3600 * 1000),
			userId: 'user_b',
			id: 'token-2',
			jwt: JWT,
		})
		prisma.user.findUnique.mockReset().mockImplementation(() => ({ clerkId: 'user_b', credits: 5 }))
		getImageDescription.mockResolvedValue(DESCRIPTION)
		expect((await POST(describeRequest(running.bytes, 'image/png'))).status).toBe(200)

		await running.end()
	}, 60_000)

	it('frees the slot of a request that fails', async () => {
		const bytes = await image('png')
		prisma.user.findUnique.mockReset().mockImplementation(() => ({ clerkId: 'user_a', credits: 100 }))
		getImageDescription.mockRejectedValue(new Error('generation failed'))
		for (let attempt = 0; attempt < 17; attempt += 1) {
			// biome-ignore lint/performance/noAwaitInLoops: one after the other, so that a slot not freed adds up
			expect((await POST(describeRequest(bytes, 'image/png'))).status).toBe(500)
		}
	}, 60_000)
})
