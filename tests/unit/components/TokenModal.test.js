import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { toast } from 'react-toastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createToken } from '@/app/actions/tokens/TokensCRUD'
import TokenModal from '@/components/Tokens/TokenModal'
import copyToClipboard from '@/helpers/copyToClipboard'

vi.mock('@/app/actions/tokens/TokensCRUD', () => ({ createToken: vi.fn() }))
vi.mock('@/helpers/copyToClipboard', () => ({ default: vi.fn() }))
vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }))

const jwt = 'header.payload.signature-for-a-new-key'

beforeEach(() => {
	vi.resetAllMocks()
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		}
	)
})
afterEach(() => {
	cleanup()
	vi.unstubAllGlobals()
})

function modal(props = {}) {
	const setTokens = vi.fn()
	const closeModal = vi.fn()
	const view = render(createElement(TokenModal, { isOpen: true, tokens: [], setTokens, closeModal, ...props }))
	return { ...view, setTokens, closeModal }
}

describe('token creation modal inputs', () => {
	it('initializes a future expiry only on the client and rejects a blank name', async () => {
		modal()
		expect(new Date(screen.getByLabelText('Expiration Date').value).getTime()).toBeGreaterThan(Date.now())
		fireEvent.click(screen.getByRole('button', { name: 'Create Token' }))
		expect(await screen.findByText('Name is required')).toBeTruthy()
		expect(createToken).not.toHaveBeenCalled()
	})

	it('rejects an expired date without sending a server action', async () => {
		modal()
		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'API key' } })
		fireEvent.change(screen.getByLabelText('Expiration Date'), { target: { value: '2000-01-01' } })
		fireEvent.click(screen.getByRole('button', { name: 'Create Token' }))
		expect(await screen.findByText('Expiration date must be in the future')).toBeTruthy()
		expect(createToken).not.toHaveBeenCalled()
	})

	it('creates one key while pending and displays the full secret only in its creation field', async () => {
		let resolve
		createToken.mockReturnValue(
			new Promise(done => {
				resolve = done
			})
		)
		const { setTokens } = modal()
		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Site 漢字' } })
		const submit = screen.getByRole('button', { name: 'Create Token' })
		fireEvent.click(submit)
		await waitFor(() => expect(createToken).toHaveBeenCalledTimes(1))
		expect(submit.disabled).toBe(true)
		fireEvent.click(submit)
		expect(createToken).toHaveBeenCalledTimes(1)
		resolve({ id: 'new-key', jwt, jwt_shortened: 'heade*****w-key' })
		await waitFor(() => expect(screen.getByDisplayValue(jwt)).toBeTruthy())
		expect(setTokens).toHaveBeenCalledWith([
			expect.objectContaining({ id: 'new-key', name: 'Site 漢字', jwt: 'heade*****w-key' }),
		])
	})

	it('keeps the form open and reports server failures without adding a key', async () => {
		createToken.mockRejectedValue(new Error('storage unavailable'))
		const { setTokens, closeModal } = modal()
		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'API key' } })
		fireEvent.click(screen.getByRole('button', { name: 'Create Token' }))
		await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to create token'))
		expect(setTokens).not.toHaveBeenCalled()
		expect(closeModal).not.toHaveBeenCalled()
	})

	it.each([true, false])('confirms copying a secret only on success: %j', async copied => {
		createToken.mockResolvedValue({ id: 'key', jwt, jwt_shortened: 'short' })
		copyToClipboard.mockResolvedValue(copied)
		modal()
		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'API key' } })
		fireEvent.click(screen.getByRole('button', { name: 'Create Token' }))
		fireEvent.click(await screen.findByRole('button', { name: 'Copy' }))
		await waitFor(() => expect(copyToClipboard).toHaveBeenCalledWith(jwt))
		expect(screen.getByRole('button', { name: copied ? 'Copied!' : 'Copy' })).toBeTruthy()
	})
})
