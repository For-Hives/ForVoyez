// The contact form's sendEmail action with the real mailgun.js 14 client and
// form-data: only the client's `url` option is changed, to a local HTTP
// server standing in for api.mailgun.net. No mail is sent.
// @vitest-environment node

import { readFileSync } from 'node:fs'
import http from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const require = createRequire(import.meta.url)

const API_KEY = 'key-test-not-a-real-mailgun-key'
const DOMAIN = 'mg.example.test'

const CONTACT = {
	message: 'Hello,\nI would like a quote for 10,000 images.',
	'phone-number': '+33 6 12 34 56 78',
	email: 'jane.doe@example.com',
	subject: 'Enterprise plan',
	'first-name': 'Jane',
	'last-name': 'Doe',
	company: 'Acme',
}

describe('sendEmail (mailgun.js 14)', () => {
	let server
	let requests
	let answer
	let restoreClient
	let sendEmail

	beforeAll(async () => {
		server = http.createServer((request, response) => {
			const chunks = []
			request.on('data', chunk => chunks.push(chunk))
			request.on('end', () => {
				requests.push({
					body: Buffer.concat(chunks),
					headers: request.headers,
					method: request.method,
					url: request.url,
				})
				response.writeHead(answer.status, {
					'Content-Type': 'application/json',
				})
				response.end(JSON.stringify(answer.body))
			})
		})
		await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
		const url = `http://127.0.0.1:${server.address().port}`

		// the same CommonJS module the action loads with require('mailgun.js')
		const Mailgun = require('mailgun.js')
		const client = Mailgun.prototype.client
		Mailgun.prototype.client = function (options) {
			return client.call(this, { ...options, url })
		}
		restoreClient = () => {
			Mailgun.prototype.client = client
		}

		vi.stubEnv('MAILGUN_API_KEY', API_KEY)
		vi.stubEnv('MAILGUN_DOMAIN', DOMAIN)
		;({ sendEmail } = await import('@/app/actions/contact/sendEmail'))
	})

	afterAll(async () => {
		restoreClient()
		vi.unstubAllEnvs()
		await new Promise(resolve => server.close(resolve))
	})

	beforeEach(() => {
		requests = []
		answer = {
			body: {
				id: '<20261008.1@mg.example.test>',
				message: 'Queued. Thank you.',
			},
			status: 200,
		}
	})

	async function formFields(request) {
		const form = await new Response(request.body, {
			headers: { 'Content-Type': request.headers['content-type'] },
		}).formData()
		return Object.fromEntries(form.entries())
	}

	it('runs against mailgun.js 14', () => {
		const manifest = path.join(path.dirname(require.resolve('mailgun.js')), '../package.json')
		expect(JSON.parse(readFileSync(manifest, 'utf8')).version).toMatch(/^14\./)
	})

	it('posts the message to the domain with the API key, as multipart form fields', async () => {
		const result = await sendEmail(CONTACT)

		expect(result).toEqual({ success: true, status: 200 })
		expect(requests).toHaveLength(1)
		const [request] = requests
		expect(request.method).toBe('POST')
		expect(request.url).toBe(`/v3/${DOMAIN}/messages`)
		expect(request.headers.authorization).toBe(`Basic ${Buffer.from(`api:${API_KEY}`).toString('base64')}`)
		expect(request.headers['content-type']).toMatch(/^multipart\/form-data; boundary=/)

		const fields = await formFields(request)
		expect(Object.keys(fields).sort()).toEqual(['from', 'h:Reply-To', 'subject', 'text', 'to'])
		expect(fields.from).toBe('ForVoyez <noreply@forvoyez.com>')
		expect(fields['h:Reply-To']).toBe('jane.doe@example.com')
		expect(fields.to).toBe('contact@andy-cinquin.fr')
		expect(fields.subject).toBe('New contact message - Enterprise plan')
		for (const line of [
			'Prénom: Jane',
			'Nom: Doe',
			'Entreprise: Acme',
			'Email: jane.doe@example.com',
			'Téléphone: +33 6 12 34 56 78',
			'I would like a quote for 10,000 images.',
		]) {
			expect(fields.text).toContain(line)
		}
	})

	it.each([
		['an address with a line break', 'jane@example.com\nBcc: x@evil.test'],
		['two addresses', 'jane@example.com, x@evil.test'],
		['a display name', 'Jane <jane@example.com>'],
		['no domain', 'jane@'],
		['an empty field', ''],
		['a missing field', undefined],
	])('sends without Reply-To when the visitor typed %s', async (_, email) => {
		const result = await sendEmail({ ...CONTACT, email })

		expect(result).toEqual({ success: true, status: 200 })
		const fields = await formFields(requests[0])
		expect(fields).not.toHaveProperty('h:Reply-To')
	})

	it('returns the Mailgun status when Mailgun refuses the message', async () => {
		answer = { body: { message: 'Forbidden' }, status: 401 }

		const result = await sendEmail(CONTACT)

		expect(requests).toHaveLength(1)
		expect(result).toMatchObject({ success: false, status: 401 })
		expect(result.details).toContain('An error occurred while sending the email')
	})
	it.each([undefined, null, false, 0, '', 'message', []])(
		'rejects non-object contact data %j before sending mail',
		async data => {
			await expect(sendEmail(data)).resolves.toEqual({
				success: false,
				status: 400,
				details: 'Invalid contact form data',
			})
			expect(requests).toHaveLength(0)
		}
	)

	it.each([null, false, 0, {}, [], 'a'.repeat(255)])(
		'omits unsupported or oversized reply-to values %j',
		async email => {
			await expect(sendEmail({ ...CONTACT, email })).resolves.toEqual({ success: true, status: 200 })
			expect(await formFields(requests[0])).not.toHaveProperty('h:Reply-To')
		}
	)
})
