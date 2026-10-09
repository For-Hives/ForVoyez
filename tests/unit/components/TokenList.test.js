import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { toast } from 'react-toastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteToken, getAllToken } from '@/app/actions/tokens/TokensCRUD'
import TokenList from '@/components/Tokens/TokenList'

vi.mock('@/app/actions/tokens/TokensCRUD', () => ({ deleteToken: vi.fn(), getAllToken: vi.fn(), createToken: vi.fn() }))
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

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

const token = { id: 'key-1', name: 'My site', jwt: 'heade*****ature', createdAt: '2026-01-01', expiredAt: '2030-01-01' }

describe('API key list and revocation UI', () => {
	it('shows the empty list and opens the creation form', async () => {
		getAllToken.mockResolvedValue([])
		render(createElement(TokenList))
		await waitFor(() => expect(getAllToken).toHaveBeenCalledTimes(1))
		expect(screen.getByText('No tokens found, create one, and it will appear here')).toBeTruthy()
		fireEvent.click(screen.getByRole('button', { name: 'Add token' }))
		expect(await screen.findByRole('button', { name: 'Create Token' })).toBeTruthy()
	})

	it('reports failed loading', async () => {
		getAllToken.mockRejectedValue(new Error('not authorized'))
		render(createElement(TokenList))
		await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error fetching tokens: not authorized'))
	})

	it('cancels revocation without changing a key', async () => {
		getAllToken.mockResolvedValue([token])
		render(createElement(TokenList))
		fireEvent.click(await screen.findByTestId('delete-token-button-0'))
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
		expect(deleteToken).not.toHaveBeenCalled()
		expect(screen.getByText('My site')).toBeTruthy()
	})

	it.each([true, false])('changes the displayed list only after successful revocation: %j', async success => {
		getAllToken.mockResolvedValue([token])
		if (success) deleteToken.mockResolvedValue(token)
		else deleteToken.mockRejectedValue(new Error('not authorized'))
		render(createElement(TokenList))
		fireEvent.click(await screen.findByTestId('delete-token-button-0'))
		fireEvent.click(screen.getByRole('button', { name: 'Revoke Key' }))
		await waitFor(() => expect(deleteToken).toHaveBeenCalledWith(token.id))
		if (success) {
			await waitFor(() => expect(screen.queryByText('My site')).toBeNull())
			expect(toast.success).toHaveBeenCalledWith('Token deleted successfully')
		} else {
			await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error deleting token: not authorized'))
			expect(screen.getByText('My site')).toBeTruthy()
		}
	})
	it('prevents repeated revocations while the server action is pending', async () => {
		getAllToken.mockResolvedValue([token])
		let resolve
		deleteToken.mockReturnValue(
			new Promise(done => {
				resolve = done
			})
		)
		render(createElement(TokenList))
		fireEvent.click(await screen.findByTestId('delete-token-button-0'))
		const revoke = screen.getByRole('button', { name: 'Revoke Key' })
		fireEvent.click(revoke)
		await waitFor(() => expect(revoke.disabled).toBe(true))
		fireEvent.click(revoke)
		expect(deleteToken).toHaveBeenCalledTimes(1)
		resolve(token)
		await waitFor(() => expect(screen.queryByText('My site')).toBeNull())
	})
})
