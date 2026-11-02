// How big a POST to a page can be (src/proxy.js). Next reads and decodes the body
// before knowing which action it calls, so the limit has to come first. Clerk is
// replaced here: only whether it is reached matters.
// @vitest-environment node

import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import proxy from '@/proxy'

const clerk = vi.hoisted(() => ({ reached: 0 }))

vi.mock('@clerk/nextjs/server', () => ({
	clerkMiddleware: () => async () => {
		clerk.reached += 1
		return new Response(null, { status: 200 })
	},
}))

const MB = 1024 * 1024

const post = (path, headers = {}, method = 'POST') =>
	new NextRequest(`https://forvoyez.com${path}`, { headers, method })

describe('size of a POST to a page', () => {
	beforeEach(() => {
		clerk.reached = 0
	})

	it.each([
		['a server action', { 'content-length': String(11 * MB), 'next-action': 'abc' }],
		[
			'a multipart POST, without the action header',
			{ 'content-length': String(11 * MB), 'content-type': 'multipart/form-data' },
		],
		['just over 1 MB', { 'content-length': String(MB + 1), 'next-action': 'abc' }],
		['a chunked body, of unknown size', { 'transfer-encoding': 'chunked', 'next-action': 'abc' }],
	])('refuses %s on the contact page', async (_, headers) => {
		const response = await proxy(post('/contact', headers), {})

		expect(response.status).toBe(413)
		expect(clerk.reached).toBe(0)
	})

	it.each([
		['the contact form', '/contact', { 'content-length': '2000', 'next-action': 'abc' }],
		['1 MB exactly', '/contact', { 'content-length': String(MB), 'next-action': 'abc' }],
		['an image of the playground', '/app/playground', { 'content-length': String(11 * MB), 'next-action': 'abc' }],
		['a POST without a body', '/app/tokens', {}],
	])('lets through %s', async (_, path, headers) => {
		const response = await proxy(post(path, headers), {})

		expect(response.status).toBe(200)
		expect(clerk.reached).toBe(1)
	})

	it('leaves other methods alone', async () => {
		const response = await proxy(post('/contact', { 'content-length': String(11 * MB) }, 'GET'), {})

		expect(response.status).toBe(200)
	})
})
