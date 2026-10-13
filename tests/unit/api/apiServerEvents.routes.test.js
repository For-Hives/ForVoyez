// POST /api/describe and GET /api/tokens report one Umami event per call,
// whatever its outcome, return the same response as before and never wait
// for Umami (the service itself is covered by apiServerEvents.test.js).
// `after()` and `fetch` are stubbed: no test ever reaches Umami.
// @vitest-environment node

import { after } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/describe/route'
import { GET } from '@/app/api/tokens/route'

import {
	blobToBase64,
	getImageDescription,
	ImageTooLargeError,
	UnsupportedImageError,
} from '@/services/imageDescription.service'
import { verifyJwt } from '@/services/jwt.service'
import { logger } from '@/services/logger.service'

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('next/server', () => ({ after: vi.fn() }))
// the image and the model are stubbed, the error classes are the real ones
vi.mock('@/services/imageDescription.service', async importOriginal => ({
	...(await importOriginal()),
	getImageDescription: vi.fn(),
	blobToBase64: vi.fn(),
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
const DESCRIPTION = { alternativeText: 'Alt', caption: 'Caption', title: 'Title' }
const MB = 1024 * 1024

const NO_CLIENT = { client_version: 'unknown', client: 'api' }
const NO_FIELD = { language_given: false, custom_schema: false, has_context: false }

let fetchMock

function describeRequest({ authorization = `Bearer ${JWT}`, host = 'forvoyez.com', image = true, fields = {} } = {}) {
	const body = new FormData()
	if (image) body.append('image', new Blob(['image bytes'], { type: 'image/png' }), 'holiday-in-rome.png')
	for (const [key, value] of Object.entries(fields)) body.append(key, value)
	return new Request('https://forvoyez.com/api/describe', {
		headers: { ...(authorization && { Authorization: authorization }), host },
		method: 'POST',
		body,
	})
}

function tokensRequest({ authorization = `Bearer ${JWT}`, host = 'forvoyez.com', headers = {} } = {}) {
	return new Request('https://forvoyez.com/api/tokens', {
		headers: { ...(authorization && { Authorization: authorization }), host, ...headers },
	})
}

// runs what the routes scheduled with after(), then lists what reached Umami
async function sentEvents() {
	await Promise.all(after.mock.calls.map(([task]) => task()))
	return fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).payload)
}

beforeEach(() => {
	vi.resetAllMocks()
	fetchMock = vi.fn(async () => Response.json({ cache: 'x' }))
	vi.stubGlobal('fetch', fetchMock)
	vi.spyOn(console, 'error').mockImplementation(() => {})
	vi.spyOn(logger, 'info').mockImplementation(() => {})

	// a valid API key, a user with credits, an image the model describes
	verifyJwt.mockResolvedValue({ userId: 'user_a' })
	prisma.token.findUnique.mockResolvedValue({
		expiredAt: new Date(Date.now() + 3600 * 1000),
		createdAt: new Date('2026-01-01T00:00:00.000Z'),
		userId: 'user_a',
		name: 'my-site',
		id: 'token-1',
		jwt: JWT,
	})
	prisma.user.findUnique.mockResolvedValueOnce({ clerkId: 'user_a', credits: 5 }).mockResolvedValueOnce({ credits: 4 })
	prisma.user.findFirst.mockResolvedValue({
		createdAt: new Date('2025-06-01T00:00:00.000Z'),
		clerkId: 'user_a',
		Subscription: [],
		credits: 42,
	})
	prisma.$transaction.mockImplementation(queries => Promise.all(queries))
	prisma.user.updateMany.mockResolvedValue({ count: 1 })
	blobToBase64.mockResolvedValue('base64ImageString')
	getImageDescription.mockResolvedValue(DESCRIPTION)
})

afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('POST /api/describe server event', () => {
	it('reports a described image, with the client and the optional fields that were sent', async () => {
		const request = describeRequest({
			fields: {
				schema: JSON.stringify({ seoTitle: 'A title for Acme' }),
				context: 'Landing page of Acme Corp',
				keywords: 'acme, colosseum',
				language: 'fr',
			},
		})
		request.headers.set('X-ForVoyez-Client', 'wordpress-plugin/1.1.43')
		request.headers.set('User-Agent', 'WordPress/6.8.1; https://customer-site.example')

		const response = await POST(request)

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual(DESCRIPTION)
		const events = await sentEvents()
		expect(events).toEqual([
			{
				data: {
					client: 'wordpress-plugin',
					client_version: '1.1.43',
					language_given: true,
					custom_schema: true,
					has_context: true,
					outcome: 'ok',
					status: 200,
				},
				website: expect.any(String),
				hostname: 'forvoyez.com',
				url: '/api/describe',
				name: 'api-describe',
				language: '',
				referrer: '',
				screen: '',
				title: '',
			},
		])
		// nothing of the customer leaves with it
		expect(JSON.stringify(fetchMock.mock.calls)).not.toMatch(
			/signature-of-the-api-key|user_a|token-1|customer-site|holiday|Acme|colosseum|seoTitle|Alt|Caption/
		)
	})

	it('reports a plain API call without optional fields', async () => {
		const response = await POST(describeRequest())

		expect(response.status).toBe(200)
		// no `schema` field: the legacy `alt_text` is still added
		expect(await response.json()).toEqual({ ...DESCRIPTION, alt_text: 'Alt' })
		expect((await sentEvents()).map(event => event.data)).toEqual([
			{ ...NO_CLIENT, ...NO_FIELD, outcome: 'ok', status: 200 },
		])
	})

	// refused before the body is read: which fields were sent is unknown
	it.each([
		['the Authorization header is missing', () => describeRequest({ authorization: null }), 401],
		[
			'the key signature is invalid',
			() => {
				verifyJwt.mockRejectedValue(new Error('Token is not signed by the server'))
				return describeRequest()
			},
			401,
		],
		[
			'the key was deleted from the dashboard',
			() => {
				prisma.token.findUnique.mockResolvedValue(null)
				return describeRequest()
			},
			401,
		],
		[
			'no credit is left',
			() => {
				prisma.user.findUnique.mockReset()
				prisma.user.findUnique.mockResolvedValue({ clerkId: 'user_a', credits: 0 })
				return describeRequest()
			},
			401,
		],
		[
			'the declared body is over 11 MB',
			() => ({
				headers: new Headers({
					'Content-Type': 'multipart/form-data; boundary=x',
					'Content-Length': String(12 * MB),
					Authorization: `Bearer ${JWT}`,
					host: 'forvoyez.com',
				}),
			}),
			413,
		],
		[
			'the body is not multipart',
			() =>
				new Request('https://forvoyez.com/api/describe', {
					headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JWT}`, host: 'forvoyez.com' },
					body: '{"image":"photo.png"}',
					method: 'POST',
				}),
			400,
		],
		[
			'the database is unreachable',
			() => {
				prisma.user.findUnique.mockReset()
				prisma.user.findUnique.mockRejectedValue(new Error('connect ECONNREFUSED db.internal:5432'))
				return describeRequest()
			},
			500,
		],
	])('reports the error when %s', async (_case, arrange, status) => {
		const response = await POST(arrange())

		expect(response.status).toBe(status)
		expect(await response.json()).toEqual({ error: expect.any(String) })
		expect((await sentEvents()).map(event => [event.name, event.data])).toEqual([
			['api-describe', { ...NO_CLIENT, outcome: 'error', status }],
		])
	})

	// refused once the body is parsed: the optional fields are known
	it.each([
		[
			'no image is sent',
			() => describeRequest({ fields: { context: 'A product page' }, image: false }),
			400,
			{
				has_context: true,
			},
		],
		['the image field is text', () => describeRequest({ fields: { image: 'not a file' }, image: false }), 400, {}],
		[
			'the schema has too many fields',
			() => {
				const schema = Object.fromEntries(Array.from({ length: 21 }, (_, index) => [`field${index}`, 'text']))
				return describeRequest({ fields: { schema: JSON.stringify(schema) } })
			},
			400,
			{ custom_schema: true },
		],
		[
			'the file is not a supported image',
			() => {
				blobToBase64.mockRejectedValue(new UnsupportedImageError())
				return describeRequest({ fields: { language: 'de' } })
			},
			400,
			{ language_given: true },
		],
		[
			'the image is over 10 MB',
			() => {
				blobToBase64.mockRejectedValue(new ImageTooLargeError())
				return describeRequest()
			},
			413,
			{},
		],
		[
			'the image cannot be processed',
			() => {
				blobToBase64.mockRejectedValue(new Error('Image processing failed: corrupt JPEG data'))
				return describeRequest()
			},
			500,
			{},
		],
		[
			'the credit was spent by a parallel request',
			() => {
				prisma.user.updateMany.mockResolvedValue({ count: 0 })
				return describeRequest()
			},
			401,
			{},
		],
		[
			'the generation fails',
			() => {
				getImageDescription.mockRejectedValue(new Error('OpenAI is down'))
				return describeRequest({ fields: { context: 'A product page', language: 'fr' } })
			},
			500,
			{ language_given: true, has_context: true },
		],
	])('reports the error when %s', async (_case, arrange, status, fields) => {
		const response = await POST(arrange())

		expect(response.status).toBe(status)
		expect(await response.json()).toEqual({ error: expect.any(String) })
		expect((await sentEvents()).map(event => [event.name, event.data])).toEqual([
			['api-describe', { ...NO_CLIENT, ...NO_FIELD, ...fields, outcome: 'error', status }],
		])
	})
})

describe('POST /api/describe answers first', () => {
	it('returns its response before Umami answers', async () => {
		// worst case: the send starts at once and Umami never answers in time
		let umamiAnswers
		fetchMock.mockReturnValue(
			new Promise(resolve => {
				umamiAnswers = resolve
			})
		)
		after.mockImplementation(task => {
			task()
		})

		const response = await POST(describeRequest())

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({ ...DESCRIPTION, alt_text: 'Alt' })
		expect(fetchMock).toHaveBeenCalledTimes(1)
		umamiAnswers(Response.json({}))
	})

	it('sends nothing itself: the event only leaves in the task given to after()', async () => {
		const response = await POST(describeRequest())

		expect(response.status).toBe(200)
		expect(after).toHaveBeenCalledTimes(1)
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it.each([
		[
			'after() throws',
			() =>
				after.mockImplementation(() => {
					throw new Error('`after` was called outside a request scope')
				}),
		],
		['Umami is unreachable', () => fetchMock.mockRejectedValue(new TypeError('fetch failed'))],
	])('answers the same when %s', async (_case, arrange) => {
		arrange()

		const ok = await POST(describeRequest())
		const unauthorized = await POST(describeRequest({ authorization: null }))
		await sentEvents()

		expect(ok.status).toBe(200)
		expect(await ok.json()).toEqual({ ...DESCRIPTION, alt_text: 'Alt' })
		expect(unauthorized.status).toBe(401)
		expect(unauthorized.statusText).toBe('Unauthorized, missing Authorization header')
		expect(await unauthorized.json()).toEqual({ error: 'Unauthorized, missing Authorization header' })
	})

	it('reports nothing outside production', async () => {
		const response = await POST(describeRequest({ host: 'localhost:3000' }))

		expect(response.status).toBe(200)
		expect(after).not.toHaveBeenCalled()
		expect(await sentEvents()).toEqual([])
	})
})

describe('GET /api/tokens server event', () => {
	it('reports a key check by the WordPress plugin, without anything about the account', async () => {
		const response = await GET(
			tokensRequest({ headers: { 'User-Agent': 'WordPress/6.8.1; https://customer-site.example' } })
		)

		expect(response.status).toBe(200)
		expect(response.headers.get('Cache-Control')).toBe('private, no-store')
		expect(await response.json()).toMatchObject({ user: { id: 'user_a', credits: 42 }, success: true })
		expect(await sentEvents()).toEqual([
			{
				data: { client_version: 'unknown', client: 'wordpress', status: 200 },
				website: expect.any(String),
				name: 'api-tokens-check',
				hostname: 'forvoyez.com',
				url: '/api/tokens',
				language: '',
				referrer: '',
				screen: '',
				title: '',
			},
		])
		expect(JSON.stringify(fetchMock.mock.calls)).not.toMatch(
			/signature-of-the-api-key|user_a|my-site|token-1|customer-site|6\.8\.1/
		)
	})

	it.each([
		['the Authorization header is missing', () => tokensRequest({ authorization: null }), 401],
		[
			'the key signature is invalid',
			() => {
				verifyJwt.mockRejectedValue(new Error('Token is not signed by the server'))
				return tokensRequest()
			},
			401,
		],
		[
			'the key carries no user',
			() => {
				verifyJwt.mockResolvedValue({})
				return tokensRequest()
			},
			400,
		],
		[
			'the key was deleted from the dashboard',
			() => {
				prisma.token.findUnique.mockResolvedValue(null)
				return tokensRequest()
			},
			401,
		],
		[
			'the user does not exist',
			() => {
				prisma.user.findFirst.mockResolvedValue(null)
				return tokensRequest()
			},
			404,
		],
		[
			'the database is unreachable',
			() => {
				prisma.user.findFirst.mockRejectedValue(new Error('connect ECONNREFUSED db.internal:5432'))
				return tokensRequest()
			},
			500,
		],
	])('reports the status when %s', async (_case, arrange, status) => {
		const response = await GET(arrange())

		expect(response.status).toBe(status)
		expect(response.headers.get('Cache-Control')).toBe('private, no-store')
		expect(await response.json()).toEqual({ error: expect.any(String) })
		expect((await sentEvents()).map(event => [event.name, event.data])).toEqual([
			['api-tokens-check', { ...NO_CLIENT, status }],
		])
	})

	it('returns its response before Umami answers', async () => {
		let umamiAnswers
		fetchMock.mockReturnValue(
			new Promise(resolve => {
				umamiAnswers = resolve
			})
		)
		after.mockImplementation(task => {
			task()
		})

		const response = await GET(tokensRequest())

		expect(response.status).toBe(200)
		expect(await response.json()).toMatchObject({ success: true })
		expect(fetchMock).toHaveBeenCalledTimes(1)
		umamiAnswers(Response.json({}))
	})

	it('answers the same when after() throws, and reports nothing outside production', async () => {
		after.mockImplementation(() => {
			throw new Error('`after` was called outside a request scope')
		})
		const production = await GET(tokensRequest())
		expect(production.status).toBe(200)
		expect(await production.json()).toMatchObject({ user: { credits: 42 }, success: true })

		after.mockReset()
		const local = await GET(tokensRequest({ host: 'localhost:3000' }))
		expect(local.status).toBe(200)
		expect(after).not.toHaveBeenCalled()
		expect(fetchMock).not.toHaveBeenCalled()
	})
})
