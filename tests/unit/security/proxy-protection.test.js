import { describe, expect, it, vi } from 'vitest'
import proxy from '@/proxy'

vi.mock('@clerk/nextjs/server', () => ({
	clerkMiddleware: handler => handler,
}))

describe('Clerk proxy protection', () => {
	it.each(['/app', '/app/tokens', '/app/playground', '/application', '/App', '/APP/tokens'])(
		'protects the existing dashboard prefix %s',
		async pathname => {
			const auth = { protect: vi.fn() }
			await proxy(auth, { nextUrl: { pathname } })
			expect(auth.protect).toHaveBeenCalledOnce()
		}
	)

	it.each([
		'/app/legals',
		'/app/legals/terms',
		'/app/legals-other',
		'/App/Legals/terms',
		'/',
		'/contact',
		'/api/describe',
	])('preserves public access to %s', async pathname => {
		const auth = { protect: vi.fn() }
		await proxy(auth, { nextUrl: { pathname } })
		expect(auth.protect).not.toHaveBeenCalled()
	})
})
