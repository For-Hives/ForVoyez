import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseTokenInput, requireTokenId } from '@/helpers/tokenInput'

const now = new Date('2026-10-09T12:00:00Z')
const valid = { name: '  My API key 🔑  ', createdAt: now, expiredAt: new Date('2027-10-09T12:00:00Z') }

describe('token input contracts', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(now)
	})
	afterEach(() => vi.useRealTimers())

	it('preserves valid names and date values while discarding caller-controlled ownership', () => {
		expect(parseTokenInput({ ...valid, userId: 'other-user', jwt: 'forged' })).toEqual(valid)
	})

	it('accepts ISO timestamps with time zone offsets', () => {
		const input = { ...valid, createdAt: '2026-10-09T14:00:00+02:00', expiredAt: '2027-10-09T14:00:00+02:00' }
		expect(parseTokenInput(input)).toEqual(input)
	})

	it.each([undefined, null, false, 0, '', [], {}, 'token'])('rejects a non-token input: %j', value => {
		expect(() => parseTokenInput(value)).toThrow('Invalid token input')
	})

	it.each(['', ' \t\n', null, undefined, 123, {}, []])('rejects invalid names: %j', name => {
		expect(() => parseTokenInput({ ...valid, name })).toThrow('Invalid token input')
	})

	it.each([null, undefined, 0, false, {}, [], '', 'not-a-date', '2027-02-30T00:00:00Z', new Date('invalid')])(
		'rejects invalid dates: %j',
		value => {
			expect(() => parseTokenInput({ ...valid, createdAt: value })).toThrow('Invalid token input')
			expect(() => parseTokenInput({ ...valid, expiredAt: value })).toThrow('Invalid token input')
		}
	)

	it('rejects expired and exactly-current expiration; accepts the next millisecond', () => {
		for (const delta of [-1, 0]) {
			expect(() => parseTokenInput({ ...valid, expiredAt: new Date(now.getTime() + delta) })).toThrow()
		}
		expect(parseTokenInput({ ...valid, expiredAt: new Date(now.getTime() + 1) }).expiredAt.getTime()).toBe(
			now.getTime() + 1
		)
	})

	it.each([null, undefined, false, 0, {}, [], '', ' \n'])('rejects invalid deletion identifiers: %j', value => {
		expect(() => requireTokenId(value)).toThrow('Invalid token id')
	})

	it('preserves a nonblank identifier', () => expect(requireTokenId('token_123')).toBe('token_123'))
})
