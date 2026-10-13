// Server-side Umami events of the public API (serverAnalytics.service): what
// leaves the server, when, and that nothing here can break an API call.
// `after()` and `fetch` are stubbed: no test ever reaches Umami.
// @vitest-environment node

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { after } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UMAMI_WEBSITE_ID } from '@/constants/umami'
import { trackDescribeCall, trackServerEvent, trackTokensCheck } from '@/services/serverAnalytics.service'

vi.mock('next/server', () => ({ after: vi.fn() }))

const PRODUCTION = { host: 'forvoyez.com' }
const OUTSIDE_REQUEST_ERROR = '`after` was called outside a request scope'

function request(headers = PRODUCTION, url = 'https://forvoyez.com/api/tokens') {
	return new Request(url, { headers })
}

function answer(status = 200) {
	return Response.json({}, { status })
}

// what Next.js does once the response is sent
function runScheduled() {
	return Promise.all(after.mock.calls.map(([task]) => task()))
}

let fetchMock
let consoleSpies

beforeEach(() => {
	vi.resetAllMocks()
	fetchMock = vi.fn(async () => Response.json({ cache: 'x' }))
	vi.stubGlobal('fetch', fetchMock)
	consoleSpies = ['error', 'warn', 'info', 'log'].map(level => vi.spyOn(console, level).mockImplementation(() => {}))
})

afterEach(() => {
	// the API logs stay as they were: the service never writes one
	for (const spy of consoleSpies) expect(spy).not.toHaveBeenCalled()
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

function sentEvents() {
	return fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body))
}

describe('API server events: which calls are reported', () => {
	it.each([
		['no host header', {}],
		['localhost', { host: 'localhost:3000' }],
		['an IP', { host: '127.0.0.1:3000' }],
		['the docs host', { host: 'doc.forvoyez.com' }],
		['a preview subdomain', { host: 'preview.forvoyez.com' }],
		['a lookalike suffix', { host: 'forvoyez.com.evil.example' }],
		['a lookalike prefix', { host: 'notforvoyez.com' }],
		['another port', { host: 'forvoyez.com:3000' }],
		['a forwarded host that is not production', { 'x-forwarded-host': 'staging.example', host: 'forvoyez.com' }],
		['a forwarded list starting elsewhere', { 'x-forwarded-host': 'staging.example, forvoyez.com' }],
	])('stays silent for %s', async (_label, headers) => {
		trackServerEvent(request(headers), 'api-tokens-check', { status: 200 })
		trackTokensCheck(request(headers), answer())
		trackDescribeCall(request(headers), answer(), new FormData())

		expect(after).not.toHaveBeenCalled()
		await runScheduled()
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it.each([
		['forvoyez.com', { host: 'forvoyez.com' }],
		['www.forvoyez.com', { host: 'www.forvoyez.com' }],
		['a host in another case', { host: 'ForVoyez.COM' }],
		['the host forwarded by the proxy', { 'x-forwarded-host': 'forvoyez.com', host: '10.0.1.7:3000' }],
		['a forwarded list starting with it', { 'x-forwarded-host': 'forvoyez.com, 10.0.1.7', host: 'app:3000' }],
	])('reports for %s', async (_label, headers) => {
		trackServerEvent(request(headers), 'api-tokens-check', { status: 200 })

		expect(after).toHaveBeenCalledTimes(1)
		await runScheduled()
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	it('ignores event names it does not know', async () => {
		for (const name of ['api-other', 'pricing-plan-click', '', undefined, '__proto__', 'constructor']) {
			trackServerEvent(request(), name, { status: 200 })
		}

		expect(after).not.toHaveBeenCalled()
	})
})

describe('API server events: what is sent', () => {
	it('sends nothing until the task scheduled with after() runs', async () => {
		trackTokensCheck(request(), answer())

		expect(after).toHaveBeenCalledTimes(1)
		expect(fetchMock).not.toHaveBeenCalled()

		await runScheduled()
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	it('posts the Umami event payload, as a browser would', async () => {
		const timeout = vi.spyOn(AbortSignal, 'timeout')

		trackServerEvent(request(), 'api-describe', { outcome: 'ok', has_context: true, status: 200 })
		await runScheduled()

		const [url, init] = fetchMock.mock.calls[0]
		expect(url).toBe('https://umami.wadefade.fr/api/send')
		expect(init.method).toBe('POST')
		expect(init.headers['Content-Type']).toBe('application/json')
		// Umami drops bots: Node's default User-Agent would be one
		expect(init.headers['User-Agent']).toMatch(/^Mozilla\/5\.0 \(.+\) AppleWebKit\/.+ Chrome\/\d+.+ Safari\//)
		expect(init.headers['User-Agent']).not.toMatch(/node|undici|bot|forvoyez/i)
		expect(timeout).toHaveBeenCalledWith(2000)
		expect(init.signal).toBe(timeout.mock.results[0].value)
		expect(JSON.parse(init.body)).toEqual({
			payload: {
				data: { outcome: 'ok', has_context: true, status: 200 },
				website: UMAMI_WEBSITE_ID,
				hostname: 'forvoyez.com',
				url: '/api/describe',
				name: 'api-describe',
				language: '',
				referrer: '',
				screen: '',
				title: '',
			},
			type: 'event',
		})
	})

	it('reports each event under its own fixed path', async () => {
		trackDescribeCall(request(PRODUCTION, 'https://forvoyez.com/api/describe?site=customer.example'), answer())
		trackTokensCheck(request(PRODUCTION, 'https://forvoyez.com/api/tokens?key=abc'), answer())
		await runScheduled()

		expect(sentEvents().map(event => [event.payload.name, event.payload.url])).toEqual([
			['api-describe', '/api/describe'],
			['api-tokens-check', '/api/tokens'],
		])
	})

	it('uses the website id of the browser tracker, from one shared constant', () => {
		const layout = readFileSync(path.resolve(process.cwd(), 'src/app/layout.js'), 'utf8')

		expect(UMAMI_WEBSITE_ID).toMatch(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/)
		expect(layout).toContain("from '@/constants/umami'")
		expect(layout).toContain('data-website-id={UMAMI_WEBSITE_ID}')
		expect(layout).not.toContain(UMAMI_WEBSITE_ID)
	})

	it('describes a describe call: outcome, status, client and which optional fields were sent', async () => {
		const formData = new FormData()
		formData.append('image', new Blob(['bytes']), 'holiday-in-rome.jpg')
		formData.append('context', 'Landing page of Acme Corp')
		formData.append('language', 'fr')
		formData.append('schema', JSON.stringify({ seoTitle: 'A title for Acme' }))

		trackDescribeCall(request({ ...PRODUCTION, 'X-ForVoyez-Client': 'wordpress-plugin/1.1.43' }), answer(), formData)
		await runScheduled()

		expect(sentEvents()[0].payload.data).toEqual({
			client: 'wordpress-plugin',
			client_version: '1.1.43',
			language_given: true,
			custom_schema: true,
			has_context: true,
			outcome: 'ok',
			status: 200,
		})
	})

	it('counts blank or missing optional fields as not sent', async () => {
		const formData = new FormData()
		formData.append('image', new Blob(['bytes']), 'photo.jpg')
		formData.append('context', '   ')
		formData.append('language', '')
		// a file where text is expected is not a schema
		formData.append('schema', new Blob(['{}']), 'schema.json')

		trackDescribeCall(request(), answer(), formData)
		await runScheduled()

		expect(sentEvents()[0].payload.data).toEqual({
			client_version: 'unknown',
			language_given: false,
			custom_schema: false,
			has_context: false,
			outcome: 'ok',
			client: 'api',
			status: 200,
		})
	})

	it.each([401, 400, 413, 500])(
		'reports a %i as an error, without field flags when the body was not parsed',
		async status => {
			trackDescribeCall(request(), answer(status))
			await runScheduled()

			expect(sentEvents()[0].payload.data).toEqual({
				client_version: 'unknown',
				outcome: 'error',
				client: 'api',
				status,
			})
		}
	)

	it('describes a key check: status and client only', async () => {
		trackTokensCheck(request(), answer(401))
		await runScheduled()

		expect(sentEvents()[0].payload.data).toEqual({ client_version: 'unknown', client: 'api', status: 401 })
	})

	it('never sends the key, the caller address, the site URL or what the customer wrote', async () => {
		const formData = new FormData()
		formData.append('image', new Blob(['secret-image-bytes']), 'holiday-in-rome.jpg')
		formData.append('context', 'Landing page of Acme Corp')
		formData.append('keywords', 'acme, colosseum')
		formData.append('language', 'Klingon')
		formData.append('schema', JSON.stringify({ seoTitle: 'A title for Acme' }))
		const headers = {
			...PRODUCTION,
			'User-Agent': 'WordPress/6.8.1; https://customer-site.example',
			Authorization: 'Bearer header.payload.signature-of-the-api-key',
			'X-Forwarded-For': '203.0.113.7',
			Cookie: 'session=abc123',
			Referer: 'https://customer-site.example/wp-admin/upload.php',
		}

		trackDescribeCall(request(headers, 'https://forvoyez.com/api/describe?email=jane@example.com'), answer(), formData)
		trackTokensCheck(request(headers, 'https://forvoyez.com/api/tokens?email=jane@example.com'), answer())
		await runScheduled()

		const sent = JSON.stringify(fetchMock.mock.calls)
		for (const secret of [
			'signature-of-the-api-key',
			'customer-site',
			'203.0.113.7',
			'abc123',
			'jane@example.com',
			'holiday-in-rome',
			'secret-image-bytes',
			'Acme',
			'colosseum',
			'Klingon',
			'seoTitle',
			'6.8.1',
		]) {
			expect(sent).not.toContain(secret)
		}
		// only the fixed headers leave, nothing copied from the caller
		for (const [, init] of fetchMock.mock.calls) {
			expect(Object.keys(init.headers).sort()).toEqual(['Content-Type', 'User-Agent'])
		}
	})
})

describe('API server events: client', () => {
	const forty = 'a'.repeat(40)

	it.each([
		// the header the plugin will send
		[{ 'X-ForVoyez-Client': 'wordpress-plugin/1.1.43' }, 'wordpress-plugin', '1.1.43'],
		[{ 'X-ForVoyez-Client': '  WordPress-Plugin/1.1.43-RC.1  ' }, 'wordpress-plugin', '1.1.43-rc.1'],
		[{ 'X-ForVoyez-Client': `${forty}/${forty}` }, forty, forty],
		// a name without a usable version
		[{ 'X-ForVoyez-Client': 'my-sdk' }, 'my-sdk', 'unknown'],
		[{ 'X-ForVoyez-Client': 'wordpress-plugin/' }, 'wordpress-plugin', 'unknown'],
		[{ 'X-ForVoyez-Client': `wordpress-plugin/${forty}1` }, 'wordpress-plugin', 'unknown'],
		[{ 'X-ForVoyez-Client': 'wordpress-plugin/1.1.43/extra' }, 'wordpress-plugin', 'unknown'],
		[{ 'X-ForVoyez-Client': 'wordpress-plugin/1.1.43; https://customer-site.example' }, 'wordpress-plugin', 'unknown'],
		[{ 'X-ForVoyez-Client': 'wordpress-plugin/1.1.43 (jane@example.com)' }, 'wordpress-plugin', 'unknown'],
		[{ 'X-ForVoyez-Client': 'wordpress-plugin/<script>alert(1)</script>' }, 'wordpress-plugin', 'unknown'],
		// hostile or malformed names: the header is ignored whole
		[{ 'X-ForVoyez-Client': `${forty}a/1.0` }, 'api', 'unknown'],
		[{ 'X-ForVoyez-Client': '<script>alert(1)</script>' }, 'api', 'unknown'],
		[{ 'X-ForVoyez-Client': 'https://customer-site.example' }, 'api', 'unknown'],
		[{ 'X-ForVoyez-Client': 'jane@example.com/1.0' }, 'api', 'unknown'],
		[{ 'X-ForVoyez-Client': 'word press/1.0' }, 'api', 'unknown'],
		[{ 'X-ForVoyez-Client': '../../etc/passwd' }, 'api', 'unknown'],
		[{ 'X-ForVoyez-Client': '{"client":"x"}' }, 'api', 'unknown'],
		[{ 'X-ForVoyez-Client': "' OR 1=1 --" }, 'api', 'unknown'],
		[{ 'X-ForVoyez-Client': 'éléphant/1.0' }, 'api', 'unknown'],
		[{ 'X-ForVoyez-Client': '/1.0' }, 'api', 'unknown'],
		[{ 'X-ForVoyez-Client': '' }, 'api', 'unknown'],
		// plugin versions that do not send the header yet
		[{ 'User-Agent': 'WordPress/6.8.1; https://customer-site.example' }, 'wordpress', 'unknown'],
		[
			{ 'User-Agent': 'WordPress/6.8.1; https://customer-site.example', 'X-ForVoyez-Client': 'not valid' },
			'wordpress',
			'unknown',
		],
		[
			{
				'User-Agent': 'WordPress/6.8.1; https://customer-site.example',
				'X-ForVoyez-Client': 'wordpress-plugin/1.1.43',
			},
			'wordpress-plugin',
			'1.1.43',
		],
		// everything else
		[{ 'User-Agent': 'curl/8.5.0' }, 'api', 'unknown'],
		[{ 'User-Agent': 'Mozilla/5.0 (compatible; WordPress/6.8.1)' }, 'api', 'unknown'],
		[{}, 'api', 'unknown'],
	])('reads %j as %s %s', async (headers, client, version) => {
		trackTokensCheck(request({ ...PRODUCTION, ...headers }), answer())
		trackDescribeCall(request({ ...PRODUCTION, ...headers }), answer())
		await runScheduled()

		for (const event of sentEvents()) {
			expect(event.payload.data).toMatchObject({ client_version: version, client })
		}
		expect(sentEvents()).toHaveLength(2)
		expect(JSON.stringify(fetchMock.mock.calls)).not.toMatch(/customer-site|example\.com|script|passwd/)
	})
})

describe('API server events: never break or slow an API call', () => {
	it('does nothing when after() is not available', async () => {
		// the real one, called here outside of a Next.js request
		const { after: realAfter } = await vi.importActual('next/server')
		expect(() => realAfter(() => {})).toThrow(OUTSIDE_REQUEST_ERROR)
		after.mockImplementation(realAfter)

		expect(() => trackTokensCheck(request(), answer())).not.toThrow()
		expect(() => trackDescribeCall(request(), answer(), new FormData())).not.toThrow()
		expect(() => trackServerEvent(request(), 'api-describe', { status: 200 })).not.toThrow()
		expect(fetchMock).not.toHaveBeenCalled()
	})

	it.each([
		['no request', undefined],
		['a request without headers', {}],
		[
			'headers that cannot be read',
			{
				headers: {
					get: () => {
						throw new Error('boom')
					},
				},
			},
		],
		['headers stored in a Map, as the unit tests of the routes do', { headers: new Map([['host', 'forvoyez.com']]) }],
		['header values that are not strings', { headers: { get: () => 42 } }],
	])('does not throw with %s', (_label, brokenRequest) => {
		expect(() => trackServerEvent(brokenRequest, 'api-describe', { status: 200 })).not.toThrow()
		expect(() => trackDescribeCall(brokenRequest, answer(), new FormData())).not.toThrow()
		expect(() => trackTokensCheck(brokenRequest, answer())).not.toThrow()
	})

	it('does not throw without a response, with a broken body or with data that cannot be serialized', () => {
		const circular = {}
		circular.self = circular
		const brokenForm = {
			get: () => {
				throw new Error('boom')
			},
		}

		expect(() => trackDescribeCall(request(), undefined, new FormData())).not.toThrow()
		expect(() => trackTokensCheck(request(), undefined)).not.toThrow()
		expect(() => trackDescribeCall(request(), answer(), brokenForm)).not.toThrow()
		expect(() => trackServerEvent(request(), 'api-describe', circular)).not.toThrow()
		expect(() => trackServerEvent(request(), 'api-describe', { big: 10n })).not.toThrow()
		expect(after).not.toHaveBeenCalled()
	})

	it.each([
		['is unreachable', () => Promise.reject(new TypeError('fetch failed'))],
		[
			'throws at once',
			() => {
				throw new Error('boom')
			},
		],
		['answers 500', async () => new Response('down', { status: 500 })],
		['answers that the sender is a bot', async () => Response.json({ beep: 'boop' })],
		['answers without a body', async () => new Response(null, { status: 204 })],
		['answers something that is not a Response', async () => undefined],
		[
			'answers a body that cannot be released',
			async () => ({ body: { cancel: () => Promise.reject(new Error('boom')) } }),
		],
	])('swallows the error when Umami %s', async (_label, implementation) => {
		fetchMock.mockImplementation(implementation)

		trackTokensCheck(request(), answer())
		await expect(runScheduled()).resolves.toBeDefined()

		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	it('gives up after the 2 s timeout, without an error', async () => {
		const controller = new AbortController()
		vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal)
		// like fetch: pending until the signal aborts, then rejects
		fetchMock.mockImplementation(
			(_url, { signal }) =>
				new Promise((_resolve, reject) => {
					signal.addEventListener('abort', () => reject(signal.reason))
				})
		)

		trackTokensCheck(request(), answer())
		const sending = runScheduled()
		controller.abort(new DOMException('The operation timed out', 'TimeoutError'))

		await expect(sending).resolves.toBeDefined()
	})

	it('releases the connection without reading the answer', async () => {
		const umamiAnswer = Response.json({ cache: 'x' })
		const cancel = vi.spyOn(umamiAnswer.body, 'cancel')
		fetchMock.mockResolvedValue(umamiAnswer)

		trackTokensCheck(request(), answer())
		await runScheduled()

		expect(cancel).toHaveBeenCalledTimes(1)
	})

	it('drops events instead of queueing them when Umami is slow', async () => {
		const pending = []
		fetchMock.mockImplementation(
			() =>
				new Promise(resolve => {
					pending.push(resolve)
				})
		)

		for (let call = 0; call < 25; call++) trackTokensCheck(request(), answer())
		const sending = runScheduled()

		// 20 sends in flight at most, the 5 others are dropped
		expect(fetchMock).toHaveBeenCalledTimes(20)

		for (const resolve of pending) resolve(Response.json({}))
		await sending

		// and sending resumes once Umami answers again
		fetchMock.mockClear()
		fetchMock.mockImplementation(async () => Response.json({}))
		after.mockClear()
		trackTokensCheck(request(), answer())
		await runScheduled()
		expect(fetchMock).toHaveBeenCalledTimes(1)
	})

	it('still counts a send as finished when it fails', async () => {
		fetchMock.mockRejectedValue(new TypeError('fetch failed'))
		for (let call = 0; call < 20; call++) trackTokensCheck(request(), answer())
		await runScheduled()

		// the 20 failed sends freed their slots: 20 more can leave
		after.mockClear()
		for (let call = 0; call < 20; call++) trackTokensCheck(request(), answer())
		await runScheduled()
		expect(fetchMock).toHaveBeenCalledTimes(40)
	})
})
