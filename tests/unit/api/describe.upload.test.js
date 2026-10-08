// POST /api/describe with real multipart requests and the real sharp: what a
// client such as `curl -F image=@photo.webp` sends. Only the API key check,
// the database and the model are stubbed.
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/describe/route'
import sharp from 'sharp'

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

const svg = Buffer.from(
	'<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="red"/></svg>'
)

function describeRequest(bytes, type, filename = 'upload') {
	const body = new FormData()
	body.append('image', new Blob([bytes], { type }), filename)
	return new Request('http://localhost/api/describe', {
		headers: { Authorization: `Bearer ${JWT}` },
		method: 'POST',
		body,
	})
}

function image(format) {
	return sharp({
		create: { background: '#c0392b', channels: 3, height: 30, width: 40 },
	})
		[format]()
		.toBuffer()
}

describe('POST /api/describe uploads', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.spyOn(console, 'info').mockImplementation(() => {})
		verifyJwt.mockResolvedValue({ userId: 'user_a' })
		prisma.token.findUnique.mockResolvedValue({
			expiredAt: new Date(Date.now() + 3600 * 1000),
			userId: 'user_a',
			id: 'token-1',
			jwt: JWT,
		})
		prisma.user.findUnique
			.mockResolvedValueOnce({ clerkId: 'user_a', credits: 5 })
			.mockResolvedValueOnce({ credits: 4 })
		prisma.$transaction.mockImplementation(queries => Promise.all(queries))
		prisma.user.updateMany.mockResolvedValue({ count: 1 })
		getImageDescription.mockResolvedValue(DESCRIPTION)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	function expectNoCharge() {
		expect(prisma.user.updateMany).not.toHaveBeenCalled()
		expect(prisma.usage.create).not.toHaveBeenCalled()
		expect(getImageDescription).not.toHaveBeenCalled()
	}

	it('describes a WebP sent as application/octet-stream (curl -F image=@x.webp)', async () => {
		const response = await POST(
			describeRequest(
				await image('webp'),
				'application/octet-stream',
				'photo.webp'
			)
		)

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({
			...DESCRIPTION,
			alt_text: 'Alt',
		})
		expect(prisma.user.updateMany).toHaveBeenCalledTimes(1)
		// the model gets the image converted to WebP
		const [base64] = getImageDescription.mock.calls[0]
		expect((await sharp(Buffer.from(base64, 'base64')).metadata()).format).toBe(
			'webp'
		)
	})

	it.each(['jpeg', 'png', 'gif'])(
		'describes a %s sent without a MIME type',
		async format => {
			const response = await POST(describeRequest(await image(format), ''))

			expect(response.status).toBe(200)
			expect(prisma.user.updateMany).toHaveBeenCalledTimes(1)
		}
	)

	// same 400 JSON, and no credit, whether the MIME type is right or wrong
	it.each([
		['SVG', 'image/svg+xml', async () => svg],
		['SVG', 'image/png', async () => svg],
		['AVIF', 'image/avif', () => image('avif')],
		['AVIF', 'image/png', () => image('avif')],
		['TIFF', 'image/tiff', () => image('tiff')],
		['TIFF', 'image/png', () => image('tiff')],
		['text file', 'image/jpeg', async () => Buffer.from('not an image')],
		['empty file', 'image/png', async () => Buffer.alloc(0)],
	])(
		'answers 400 JSON for a %s sent as %s, without charging',
		async (_name, type, makeBytes) => {
			const response = await POST(describeRequest(await makeBytes(), type))

			expect(response.status).toBe(400)
			expect(response.headers.get('Content-Type')).toContain('application/json')
			expect(await response.json()).toEqual({
				error: 'Bad Request, Invalid image file',
			})
			expectNoCharge()
		}
	)
})
