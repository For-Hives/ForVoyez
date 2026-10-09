import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import copyToClipboard from '@/helpers/copyToClipboard'

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
	document.body.innerHTML = ''
})

describe('clipboard input and browser contracts', () => {
	it.each(['', 'é漢字 🔑', 'line one\nline two'])('awaits successful copying of %j', async content => {
		const writeText = vi.fn().mockResolvedValue(undefined)
		vi.stubGlobal('navigator', { clipboard: { writeText } })
		await expect(copyToClipboard(content)).resolves.toBe(true)
		expect(writeText).toHaveBeenCalledWith(content)
	})

	it.each([undefined, null, false, 0, {}, []])('rejects non-string input %j', async content => {
		const writeText = vi.fn()
		vi.stubGlobal('navigator', { clipboard: { writeText } })
		await expect(copyToClipboard(content)).resolves.toBe(false)
		expect(writeText).not.toHaveBeenCalled()
	})

	it('does not report success when clipboard permission is denied', async () => {
		vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('permission denied')) } })
		await expect(copyToClipboard('token')).resolves.toBe(false)
	})

	it.each([true, false])('cleans up the legacy fallback after result %j', async result => {
		vi.stubGlobal('navigator', {})
		document.execCommand = vi.fn().mockReturnValue(result)
		await expect(copyToClipboard('token')).resolves.toBe(result)
		expect(document.execCommand).toHaveBeenCalledWith('copy')
		expect(document.querySelector('textarea')).toBeNull()
	})

	it('cleans up a throwing or unavailable legacy fallback', async () => {
		vi.stubGlobal('navigator', {})
		document.execCommand = vi.fn(() => {
			throw new Error('unsupported')
		})
		await expect(copyToClipboard('token')).resolves.toBe(false)
		expect(document.querySelector('textarea')).toBeNull()
		document.execCommand = undefined
		await expect(copyToClipboard('token')).resolves.toBe(false)
		expect(document.querySelector('textarea')).toBeNull()
	})
})
