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

	describe('request bodies', () => {
		const MB = 1024 * 1024
		const TOO_LARGE = { error: 'Image too large: the maximum is 10 MB' }

		function post(body, headers = {}) {
			return POST(
				new Request('http://localhost/api/describe', {
					headers: { Authorization: `Bearer ${JWT}`, ...headers },
					duplex: 'half',
					method: 'POST',
					body,
				})
			)
		}

		// a body sent without Content-Length (Transfer-Encoding: chunked)
		function chunkedBody(totalBytes, chunkBytes = MB) {
			let sent = 0
			const stream = new ReadableStream({
				pull(controller) {
					if (sent >= totalBytes) return controller.close()
					const size = Math.min(chunkBytes, totalBytes - sent)
					sent += size
					controller.enqueue(new Uint8Array(size))
				},
			})
			return { sent: () => sent, stream }
		}

		async function expectJson(response, status, body) {
			expect(response.status).toBe(status)
			expect(response.headers.get('Content-Type')).toContain('application/json')
			expect(await response.json()).toEqual(body)
			expectNoCharge()
		}

		it('answers 413 JSON when Content-Length is over 11 MB, without reading the body', async () => {
			const body = chunkedBody(12 * MB)

			const response = await post(body.stream, {
				'Content-Type': 'multipart/form-data; boundary=x',
				'Content-Length': String(12 * MB),
			})

			await expectJson(response, 413, TOO_LARGE)
			expect(body.sent()).toBeLessThanOrEqual(MB)
		})

		it('answers 413 JSON when a body sent without Content-Length goes over 11 MB, and stops reading it', async () => {
			const body = chunkedBody(50 * MB)

			const response = await post(body.stream, {
				'Content-Type': 'multipart/form-data; boundary=x',
			})

			await expectJson(response, 413, TOO_LARGE)
			expect(body.sent()).toBeLessThanOrEqual(13 * MB)
		})

		it('answers 413 JSON for an image over 10 MB in a body under 11 MB', async () => {
			const response = await POST(
				describeRequest(Buffer.alloc(10 * MB + 1), 'image/png')
			)

			await expectJson(response, 413, TOO_LARGE)
		})

		it('describes an image sent without Content-Length', async () => {
			// the multipart encoding of a PNG, sent in two chunks
			const form = new FormData()
			form.append('image', new Blob([await image('png')]), 'photo.png')
			const encoded = new Request('http://localhost/', {
				method: 'POST',
				body: form,
			})
			const bytes = new Uint8Array(await encoded.arrayBuffer())

			const response = await post(
				new ReadableStream({
					start(controller) {
						controller.enqueue(bytes.slice(0, 100))
						controller.enqueue(bytes.slice(100))
						controller.close()
					},
				}),
				{ 'Content-Type': encoded.headers.get('Content-Type') }
			)

			expect(response.status).toBe(200)
			expect(prisma.user.updateMany).toHaveBeenCalledTimes(1)
		})

		it.each([
			[
				'a broken multipart body',
				'--x\r\nContent-Disposition: form-data; name="image"',
				'multipart/form-data; boundary=x',
			],
			['a JSON body', '{"image":"x"}', 'application/json'],
			['a multipart body without boundary', 'abc', 'multipart/form-data'],
		])('answers 400 JSON for %s', async (_case, body, contentType) => {
			const response = await post(body, { 'Content-Type': contentType })

			await expectJson(response, 400, {
				error: 'Bad Request, the body must be multipart/form-data',
			})
		})
	})
})
