import { describe, expect, it, vi } from 'vitest'
import { forEachInSequence } from '@/helpers/forEachInSequence'

describe('forEachInSequence', () => {
	it('waits for each operation before starting the next', async () => {
		const events = []
		await forEachInSequence([1, 2, 3], async item => {
			events.push(`start ${item}`)
			await Promise.resolve()
			events.push(`end ${item}`)
		})
		expect(events).toEqual(['start 1', 'end 1', 'start 2', 'end 2', 'start 3', 'end 3'])
	})

	it('stops after a rejection without starting later operations', async () => {
		const failure = new Error('failed')
		const action = vi.fn().mockRejectedValue(failure)
		await expect(forEachInSequence([1, 2, 3], action)).rejects.toBe(failure)
		expect(action.mock.calls).toEqual([[1]])
	})

	it('accepts iterators used by the model comparison script', async () => {
		const action = vi.fn()
		await forEachInSequence(['first', 'second'].entries(), action)
		expect(action.mock.calls).toEqual([[[0, 'first']], [[1, 'second']]])
	})

	it('does nothing for an empty collection', async () => {
		const action = vi.fn()
		await forEachInSequence([], action)
		expect(action).not.toHaveBeenCalled()
	})
})
