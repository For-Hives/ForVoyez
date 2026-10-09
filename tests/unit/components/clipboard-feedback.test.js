import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PlaygroundPreviewCode from '@/components/Playground/PlaygroundPreviewCode.component'
import PlaygroundResponse from '@/components/Playground/PlaygroundResponse.component'
import copyToClipboard from '@/helpers/copyToClipboard'

vi.mock('@/helpers/copyToClipboard', () => ({ default: vi.fn() }))
vi.mock('@/components/Playground/LoadAnimation', () => ({
	LoadAnimation: () => createElement('div', { 'data-testid': 'processing' }),
}))
vi.mock('@/helpers/highlightCode', () => ({ highlightCode: vi.fn() }))

beforeEach(() => vi.resetAllMocks())
afterEach(() => cleanup())

describe('clipboard feedback reflects actual browser results', () => {
	it.each([true, false])('reports response copy result %j correctly', async copied => {
		copyToClipboard.mockResolvedValue(copied)
		render(createElement(PlaygroundResponse, { response: { title: 'An image' } }))
		fireEvent.click(screen.getByRole('button', { name: 'Copy response' }))
		await waitFor(() => expect(copyToClipboard).toHaveBeenCalledWith(JSON.stringify({ title: 'An image' }, null, 4)))
		expect(screen.getByRole('button', { name: copied ? 'Copied response' : 'Copy response' })).toBeTruthy()
	})

	it('shows processing instead of an old response while generation is pending', () => {
		render(createElement(PlaygroundResponse, { processingResultApi: true, response: { title: 'old' } }))
		expect(screen.getByTestId('processing')).toBeTruthy()
		expect(screen.queryByRole('button', { name: 'Copy response' })).toBeNull()
	})

	it.each([true, false])('reports request copy result %j correctly', async copied => {
		copyToClipboard.mockResolvedValue(copied)
		render(createElement(PlaygroundPreviewCode, { formData: { context: '', languageToTranslate: 'en' } }))
		fireEvent.click(screen.getByText('Request Preview'))
		fireEvent.click(screen.getByRole('button', { name: 'Copy request' }))
		await waitFor(() => expect(copyToClipboard).toHaveBeenCalledTimes(1))
		expect(screen.getByRole('button', { name: copied ? 'Copied request' : 'Copy request' })).toBeTruthy()
	})
})
