import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createConcurrencyGate, createInFlightLimiter, createRateLimiter } from '@/helpers/rateLimit'

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

describe('createRateLimiter isOver', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] })
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('says whether the next hit would be refused, without counting one', () => {
		const hit = createRateLimiter({ windowMs: 1000, limit: 2 })

		expect(hit.isOver('a')).toBe(false)
		hit('a')
		expect(hit.isOver('a')).toBe(false)
		expect(hit.isOver('a')).toBe(false)
		hit('a')
		expect(hit.isOver('a')).toBe(true)
		expect(hit.isOver('b')).toBe(false)

		vi.advanceTimersByTime(1000)
		expect(hit.isOver('a')).toBe(false)
	})
})

describe('createInFlightLimiter', () => {
	it('refuses a key at its limit until one of its requests ends', () => {
		const acquire = createInFlightLimiter(2)
		const first = acquire('a')
		const second = acquire('a')

		expect(first).toBeTypeOf('function')
		expect(second).toBeTypeOf('function')
		expect(acquire('a')).toBeNull()
		expect(acquire('b')).toBeTypeOf('function')

		first()
		expect(acquire('a')).toBeTypeOf('function')
		expect(acquire('a')).toBeNull()
	})

	it('counts one end only once, even when released twice', () => {
		const acquire = createInFlightLimiter(1)
		const release = acquire('a')

		release()
		acquire('a')
		release()

		expect(acquire('a')).toBeNull()
	})
})

describe('createConcurrencyGate', () => {
	function task() {
		let finish
		let fail
		const done = new Promise((resolve, reject) => {
			finish = resolve
			fail = reject
		})
		const run = vi.fn(() => done)
		return { fail, finish, run }
	}

	const nextTurn = () => new Promise(resolve => setImmediate(resolve))

	it('runs one task at a time, in order, and returns each result', async () => {
		const gate = createConcurrencyGate(1)
		const [a, b, c] = [task(), task(), task()]

		const results = [gate(a.run), gate(b.run), gate(c.run)]
		await nextTurn()
		expect(a.run).toHaveBeenCalledTimes(1)
		expect(b.run).not.toHaveBeenCalled()

		a.finish('a')
		await nextTurn()
		expect(b.run).toHaveBeenCalledTimes(1)
		expect(c.run).not.toHaveBeenCalled()

		b.finish('b')
		await nextTurn()
		c.finish('c')
		await expect(Promise.all(results)).resolves.toEqual(['a', 'b', 'c'])
	})

	it('moves on when a task fails, and gives the failure to its caller', async () => {
		const gate = createConcurrencyGate(1)
		const [a, b] = [task(), task()]

		const first = gate(a.run)
		const second = gate(b.run)
		a.fail(new Error('decode failed'))

		await expect(first).rejects.toThrow('decode failed')
		await nextTurn()
		b.finish('b')
		await expect(second).resolves.toBe('b')
	})

	it('is free again once everything has ended', async () => {
		const gate = createConcurrencyGate(1)
		await gate(async () => 'a')

		const b = task()
		const result = gate(b.run)
		await nextTurn()
		expect(b.run).toHaveBeenCalledTimes(1)
		b.finish('b')
		await expect(result).resolves.toBe('b')
	})
})
