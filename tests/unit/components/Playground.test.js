import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { toast } from 'react-toastify'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { describePlaygroundAction } from '@/app/actions/app/playground'
import { getMyCredits } from '@/app/actions/app/usage'
import { Playground } from '@/components/Playground/Playground.component'

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), info: vi.fn() } }))
vi.mock('@/app/actions/app/playground', () => ({
	describePlaygroundAction: vi.fn(),
}))
vi.mock('@/app/actions/app/usage', () => ({ getMyCredits: vi.fn() }))
vi.mock('@/components/Playground/PlaygroundPreviewCode.component', () => ({
	default: () => null,
}))
vi.mock('@/components/Playground/PlaygroundResponse.component', () => ({
	default: props =>
		createElement('pre', { 'data-testid': 'response' }, props.response == null ? '' : JSON.stringify(props.response)),
}))

// Stand-in form: lets the test pick a file and submit, whatever its size.
let pickedFile
vi.mock('@/components/Playground/PlaygroundForm.component', () => ({
	default: props =>
		createElement(
			'div',
			null,
			createElement(
				'button',
				{
					type: 'submit',
					onClick: () => props.setFormData({ ...props.formData, image: pickedFile }),
				},
				'pick'
			),
			createElement('button', { type: 'submit', onClick: props.handleSubmit }, 'analyze')
		),
}))

function imageOfSize(size) {
	const file = new File(['x'], 'photo.png', { type: 'image/png' })
	Object.defineProperty(file, 'size', { value: size })
	return file
}

describe('Playground', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		// jsdom has no layout: scrollIntoView does not exist
		Element.prototype.scrollIntoView = vi.fn()
		getMyCredits.mockResolvedValue(5)
		describePlaygroundAction.mockResolvedValue({ status: 200, data: {} })
	})

	afterEach(() => {
		cleanup()
	})

	it('shows an error toast (no ReferenceError) for an image over 10 MB', async () => {
		pickedFile = imageOfSize(10 * 1024 * 1024 + 1)
		render(createElement(Playground))

		fireEvent.click(screen.getByText('pick'))
		fireEvent.click(screen.getByText('analyze'))

		expect(toast.error).toHaveBeenCalledWith('Image size should not exceed 10MB')
		expect(describePlaygroundAction).not.toHaveBeenCalled()
	})

	it('shows an error toast when no image is selected', async () => {
		render(createElement(Playground))

		fireEvent.click(screen.getByText('analyze'))

		expect(toast.error).toHaveBeenCalledWith('Please select an image')
		expect(describePlaygroundAction).not.toHaveBeenCalled()
	})

	it('shows the error message returned by the action', async () => {
		describePlaygroundAction.mockResolvedValue({
			error: 'Invalid schema: at most 20 fields are allowed',
			status: 400,
		})
		pickedFile = imageOfSize(1024)
		render(createElement(Playground))

		fireEvent.click(screen.getByText('pick'))
		fireEvent.click(screen.getByText('analyze'))

		expect(await screen.findByText('"Invalid schema: at most 20 fields are allowed"')).toBeTruthy()
	})

	it('sends a 10 MB image to the action', async () => {
		pickedFile = imageOfSize(10 * 1024 * 1024)
		render(createElement(Playground))

		fireEvent.click(screen.getByText('pick'))
		fireEvent.click(screen.getByText('analyze'))

		expect(toast.error).not.toHaveBeenCalled()
		expect(describePlaygroundAction).toHaveBeenCalledTimes(1)
	})
})
