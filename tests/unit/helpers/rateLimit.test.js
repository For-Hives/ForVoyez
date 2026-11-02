import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRateLimiter } from '@/helpers/rateLimit'

describe('createRateLimiter', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] })
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('allows up to the limit per key, then refuses until the window ends', () => {
		const isAllowed = createRateLimiter({ windowMs: 1000, limit: 2 })

		expect([isAllowed('a'), isAllowed('a'), isAllowed('a')]).toEqual([true, true, false])
		expect(isAllowed('b')).toBe(true)

		vi.advanceTimersByTime(1000)
		expect(isAllowed('a')).toBe(true)
	})

	it('never remembers more keys than maxKeys, forgetting the expired ones first', () => {
		const isAllowed = createRateLimiter({ windowMs: 1000, maxKeys: 1, limit: 1 })

		expect(isAllowed('a')).toBe(true)
		// full: `b` is not remembered, so it is not limited here either
		expect([isAllowed('b'), isAllowed('b')]).toEqual([true, true])
		expect(isAllowed('a')).toBe(false)

		vi.advanceTimersByTime(1000)
		expect([isAllowed('b'), isAllowed('b')]).toEqual([true, false])
	})
})
