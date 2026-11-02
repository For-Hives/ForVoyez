// How many messages the public contact action sends. The action is callable
// without the form and each message costs a Mailgun send. Mailgun is replaced
// at its client: no mail is sent.
// @vitest-environment node

import { createRequire } from 'node:module'
import { headers } from 'next/headers'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { forEachInSequence } from '@/helpers/forEachInSequence'

vi.mock('next/headers', () => ({ headers: vi.fn() }))

const require = createRequire(import.meta.url)
const Mailgun = require('mailgun.js')
const originalClient = Mailgun.prototype.client
const create = vi.fn()
Mailgun.prototype.client = () => ({ messages: { create } })

const CONTACT = { 'first-name': 'Jane', 'last-name': 'Doe', email: 'jane@example.com', message: 'Hello' }

function fromAddress(forwardedFor) {
	headers.mockResolvedValue(new Headers(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}))
}

describe('sendEmail rate limits', () => {
	let sendEmail

	// `count` messages, one after the other; `before` sets the address of each
	async function send(count, before = () => {}) {
		const results = []
		await forEachInSequence(Array.from({ length: count }).keys(), async index => {
			before(index)
			results.push(await sendEmail(CONTACT))
		})
		return results
	}

	beforeEach(async () => {
		vi.resetModules()
		create.mockReset().mockResolvedValue({ id: 'queued' })
		;({ sendEmail } = await import('@/app/actions/contact/sendEmail'))
	})

	afterAll(() => {
		Mailgun.prototype.client = originalClient
	})

	it('refuses a sixth message from one address within the window', async () => {
		fromAddress('203.0.113.7')
		for (const result of await send(5)) {
			expect(result).toEqual({ success: true, status: 200 })
		}

		await expect(sendEmail(CONTACT)).resolves.toMatchObject({ success: false, status: 429 })
		expect(create).toHaveBeenCalledTimes(5)
	})

	it('counts the address the reverse proxy added, not one the client made up', async () => {
		await send(5, index => fromAddress(`198.51.100.${index}, 203.0.113.7`))

		fromAddress('198.51.100.99, 203.0.113.7')
		await expect(sendEmail(CONTACT)).resolves.toMatchObject({ status: 429 })
	})

	it('does not let one address use up the quota of another', async () => {
		fromAddress('203.0.113.7')
		await send(6)

		fromAddress('203.0.113.8')
		await expect(sendEmail(CONTACT)).resolves.toEqual({ success: true, status: 200 })
	})

	it('counts refused bodies for their address, without sending anything', async () => {
		const tooLong = { ...CONTACT, message: 'x'.repeat(20_001) }
		fromAddress('203.0.113.7')
		await forEachInSequence(Array.from({ length: 5 }).keys(), async () => {
			await expect(sendEmail(tooLong)).resolves.toMatchObject({ status: 400 })
		})

		await expect(sendEmail(tooLong)).resolves.toMatchObject({ status: 429 })
		await expect(sendEmail(CONTACT)).resolves.toMatchObject({ status: 429 })
		expect(create).not.toHaveBeenCalled()
	})

	it('does not let refused bodies use up the total', async () => {
		const tooLong = { ...CONTACT, message: 'x'.repeat(20_001) }
		await forEachInSequence(Array.from({ length: 70 }).keys(), async index => {
			fromAddress(`203.0.${Math.floor(index / 4)}.${index % 4}`)
			await expect(sendEmail(tooLong)).resolves.toMatchObject({ status: 400 })
		})

		fromAddress('198.51.100.1')
		await expect(sendEmail(CONTACT)).resolves.toEqual({ success: true, status: 200 })
	})

	it('caps the total too, whatever the addresses say', async () => {
		const results = await send(60, index => fromAddress(`203.0.${Math.floor(index / 4)}.${index % 4}`))
		expect(results.every(result => result.success)).toBe(true)

		fromAddress('192.0.2.1')
		await expect(sendEmail(CONTACT)).resolves.toMatchObject({ success: false, status: 429 })
		expect(create).toHaveBeenCalledTimes(60)
	})

	it('still applies the total cap when the address is unknown', async () => {
		fromAddress(undefined)
		const results = await send(60)
		expect(results.every(result => result.success)).toBe(true)

		await expect(sendEmail(CONTACT)).resolves.toMatchObject({ status: 429 })
	})

	it('allows a new message once the window has passed', async () => {
		vi.useFakeTimers({ toFake: ['Date'] })
		try {
			fromAddress('203.0.113.7')
			await send(6)
			await expect(sendEmail(CONTACT)).resolves.toMatchObject({ status: 429 })

			vi.advanceTimersByTime(10 * 60 * 1000 + 1)
			await expect(sendEmail(CONTACT)).resolves.toEqual({ success: true, status: 200 })
		} finally {
			vi.useRealTimers()
		}
	})
})
