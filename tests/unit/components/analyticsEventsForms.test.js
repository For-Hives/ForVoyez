import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { describePlaygroundAction } from '@/app/actions/app/playground'
import { getMyCredits } from '@/app/actions/app/usage'
import { sendEmail } from '@/app/actions/contact/sendEmail'
import { ContactComponent } from '@/components/Contact/Contact.component'
import { Playground } from '@/components/Playground/Playground.component'
import PlaygroundPreviewCode from '@/components/Playground/PlaygroundPreviewCode.component'
import PlaygroundResponse from '@/components/Playground/PlaygroundResponse.component'
import { setSignedIn } from '@/helpers/analytics'
import copyToClipboard from '@/helpers/copyToClipboard'

vi.mock('@/app/actions/contact/sendEmail', () => ({ sendEmail: vi.fn() }))
vi.mock('@/app/actions/app/playground', () => ({ describePlaygroundAction: vi.fn() }))
vi.mock('@/app/actions/app/usage', () => ({ getMyCredits: vi.fn() }))
vi.mock('@/helpers/copyToClipboard', () => ({ default: vi.fn() }))
vi.mock('@/helpers/highlightCode', () => ({ highlightCode: vi.fn() }))
vi.mock('react-toastify', () => ({ toast: Object.assign(vi.fn(), { error: vi.fn(), info: vi.fn() }) }))

const MB = 1024 * 1024

// what the visitor types or uploads: none of it may reach Umami
const CONTACT_FIELDS = {
	'First name *': 'Élodie',
	'Last name *': 'Dupont',
	'Email *': 'elodie@example.test',
	'Message *': 'My key is broken, call me',
}
const SECRET_CONTEXT = 'Product photo for the spring sale'
const SECRET_FILE_NAME = 'holiday-with-jane-doe.png'

function events(name) {
	return window.umami.track.mock.calls.filter(([sent]) => sent === name).map(([, data]) => data)
}

function everythingSent() {
	return JSON.stringify(window.umami.track.mock.calls)
}

function image({ size = 2 * MB, type = 'image/png', name = SECRET_FILE_NAME } = {}) {
	const file = new File(['x'], name, { type })
	Object.defineProperty(file, 'size', { value: size })
	return file
}

beforeEach(() => {
	vi.resetAllMocks()
	window.umami = { track: vi.fn() }
	// jsdom has no layout and no object URLs
	Element.prototype.scrollIntoView = vi.fn()
	URL.createObjectURL = vi.fn(() => 'blob:preview')
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
	vi.useRealTimers()
	vi.unstubAllGlobals()
	delete window.umami
	setSignedIn(undefined)
})

describe('contact form events', () => {
	function fillContact() {
		for (const [label, value] of Object.entries(CONTACT_FIELDS)) {
			fireEvent.change(screen.getByLabelText(label), { target: { value } })
		}
	}

	function submit() {
		fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
	}

	it('sends the outcome of a delivered message, and nothing the visitor typed', async () => {
		sendEmail.mockResolvedValue({ success: true, status: 200 })
		render(createElement(ContactComponent))
		fillContact()

		submit()

		await waitFor(() => expect(events('contact-form-submit')).toEqual([{ outcome: 'ok' }]))
		expect(window.umami.track).toHaveBeenCalledTimes(1)
		for (const value of Object.values(CONTACT_FIELDS)) expect(everythingSent()).not.toContain(value)
	})

	it.each([
		[
			'the server refuses the message',
			() => sendEmail.mockResolvedValue({ success: false, details: 'Service unavailable' }),
		],
		['the server action fails', () => sendEmail.mockRejectedValue(new Error('connection failed'))],
	])('sends an error outcome when %s', async (_case, arrange) => {
		arrange()
		render(createElement(ContactComponent))
		fillContact()

		submit()

		await waitFor(() => expect(events('contact-form-submit')).toEqual([{ outcome: 'error' }]))
		expect(everythingSent()).not.toMatch(/Service unavailable|connection failed/)
	})

	it('names the fields refused by the validation, without their content', async () => {
		render(createElement(ContactComponent))
		fireEvent.change(screen.getByLabelText('First name *'), { target: { value: 'Élodie' } })

		submit()

		await waitFor(() => expect(events('contact-form-invalid')).toEqual([{ fields: 'email,last-name,message' }]))
		expect(events('contact-form-submit')).toEqual([])
		expect(sendEmail).not.toHaveBeenCalled()
		expect(everythingSent()).not.toContain('Élodie')
	})

	it('adds the signed-in segment when Clerk has answered', async () => {
		setSignedIn(false)
		sendEmail.mockResolvedValue({ success: true })
		render(createElement(ContactComponent))
		fillContact()

		submit()

		await waitFor(() => expect(events('contact-form-submit')).toEqual([{ outcome: 'ok', signed_in: false }]))
	})

	it('still sends the message when the tracker throws', async () => {
		window.umami.track.mockImplementation(() => {
			throw new Error('tracker crashed')
		})
		sendEmail.mockResolvedValue({ success: true })
		render(createElement(ContactComponent))
		fillContact()

		submit()

		await waitFor(() => expect(sendEmail).toHaveBeenCalledTimes(1))
		await waitFor(() => expect(screen.getByLabelText('Message *').value).toBe(''))
	})

	it('tracks the opening and the closing of a question', () => {
		render(createElement(ContactComponent))
		const question = screen.getByRole('button', { name: 'Which image formats can I use?' })

		fireEvent.click(question)
		fireEvent.click(question)

		expect(events('contact-faq-toggle')).toEqual([
			{ action: 'open', question: 'which-image-formats-can-i-use' },
			{ action: 'close', question: 'which-image-formats-can-i-use' },
		])
		// the panel really opened and closed: the click still does its job
		expect(screen.queryByText(/supports JPEG, PNG, WebP/)).toBeNull()
	})
})

describe('playground events', () => {
	const UNTOUCHED = { custom_schema: false, has_context: false, has_keywords: false, has_language: false }

	async function renderPlayground() {
		render(createElement(Playground))
		// the button stays disabled until the balance is known
		await screen.findByTestId('user-credits')
	}

	function pickImage(file = image()) {
		fireEvent.change(screen.getByTestId('upload-input'), { target: { files: [file] } })
	}

	function analyze() {
		fireEvent.click(screen.getByTestId('analyze-button'))
	}

	beforeEach(() => {
		getMyCredits.mockResolvedValue(5)
		describePlaygroundAction.mockResolvedValue({ status: 200, data: { title: 'A title' } })
	})

	it('describes a picked image by its type and size, never its name', async () => {
		await renderPlayground()

		pickImage()

		expect(events('playground-image-select')).toEqual([
			{ outcome: 'ok', size_bucket: '1mb-5mb', type: 'png', via: 'click' },
		])
		expect(everythingSent()).not.toContain('holiday')
	})

	it('tells a dropped image from a picked one, and reports a refused file type', async () => {
		await renderPlayground()
		const dropZone = screen.getByTestId('upload-area').parentElement

		fireEvent.drop(dropZone, {
			dataTransfer: { files: [image({ type: 'application/pdf', name: 'contract.pdf', size: 50_000 })] },
		})
		fireEvent.drop(dropZone, { dataTransfer: { files: [image({ type: 'image/webp', size: 6 * MB })] } })

		expect(events('playground-image-select')).toEqual([
			{ outcome: 'error', size_bucket: 'under-100kb', type: 'other', via: 'drop' },
			{ outcome: 'ok', size_bucket: '5mb-10mb', type: 'webp', via: 'drop' },
		])
		expect(everythingSent()).not.toMatch(/contract|holiday/)
	})

	it('sends nothing when the file dialog is closed without a file', async () => {
		await renderPlayground()

		fireEvent.change(screen.getByTestId('upload-input'), { target: { files: [] } })

		expect(events('playground-image-select')).toEqual([])
	})

	it('sends the click, then the result with its duration, for a successful analysis', async () => {
		vi.useFakeTimers({ toFake: ['Date'] })
		describePlaygroundAction.mockImplementation(() => {
			// the generation took 3 seconds
			vi.setSystemTime(Date.now() + 3000)
			return Promise.resolve({ status: 200, data: { title: 'A title' } })
		})
		await renderPlayground()
		pickImage()

		analyze()

		const request = { ...UNTOUCHED, size_bucket: '1mb-5mb', type: 'png' }
		await waitFor(() =>
			expect(events('playground-analyze-result')).toEqual([
				{ ...request, duration: '2s-5s', outcome: 'ok', status: '200' },
			])
		)
		expect(events('playground-analyze-click')).toEqual([request])
		expect(describePlaygroundAction).toHaveBeenCalledTimes(1)
	})

	it('says which options were filled, without what was typed in them', async () => {
		await renderPlayground()
		pickImage()
		fireEvent.click(screen.getByRole('button', { name: 'Add Your Context (Optional)' }))
		fireEvent.change(screen.getByTestId('context-input'), { target: { value: SECRET_CONTEXT } })
		fireEvent.click(screen.getByRole('button', { name: 'Language (Optional)' }))
		fireEvent.change(screen.getByPlaceholderText(/Enter language code/), { target: { value: 'Klingon' } })

		analyze()

		await waitFor(() => expect(events('playground-analyze-result')).toHaveLength(1))
		expect(events('playground-analyze-click')).toEqual([
			{
				custom_schema: false,
				has_context: true,
				has_keywords: false,
				has_language: true,
				size_bucket: '1mb-5mb',
				type: 'png',
			},
		])
		expect(events('playground-option-toggle')).toEqual([
			{ action: 'open', option: 'context' },
			{ action: 'open', option: 'language' },
		])
		// the server action did receive them
		expect(describePlaygroundAction.mock.calls[0][0].get('data')).toContain(SECRET_CONTEXT)
		expect(everythingSent()).not.toMatch(/spring sale|Klingon|holiday/)
	})

	it.each([
		['an answer refused by the action', () => Promise.resolve({ status: 400, error: 'Invalid schema' }), '400'],
		['a failed action', () => Promise.reject(new Error('No credits left')), 'exception'],
	])('sends an error result for %s', async (_case, answer, status) => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		describePlaygroundAction.mockImplementation(answer)
		await renderPlayground()
		pickImage()

		analyze()

		await waitFor(() => expect(events('playground-analyze-result')).toHaveLength(1))
		expect(events('playground-analyze-result')[0]).toMatchObject({ outcome: 'error', status, duration: 'under-2s' })
		expect(everythingSent()).not.toMatch(/Invalid schema|No credits left/)
		vi.restoreAllMocks()
	})

	it('sends an error result, and no request, for an image over 10 MB', async () => {
		await renderPlayground()
		pickImage(image({ size: 10 * MB + 1 }))

		analyze()

		const request = { ...UNTOUCHED, size_bucket: 'over-10mb', type: 'png' }
		expect(events('playground-analyze-click')).toEqual([request])
		expect(events('playground-analyze-result')).toEqual([{ ...request, outcome: 'error', status: 'too-large' }])
		expect(describePlaygroundAction).not.toHaveBeenCalled()
	})

	it('reports once that the account has no credit left', async () => {
		getMyCredits.mockResolvedValue(0)
		render(createElement(Playground))

		const link = await screen.findByTestId('tooltip-link')

		expect(link.getAttribute('data-fv-event')).toBe('playground-no-credits-click')
		expect(events('playground-no-credits-view')).toEqual([undefined])
	})

	it('does not report missing credits for an account that has some', async () => {
		await renderPlayground()

		expect(events('playground-no-credits-view')).toEqual([])
	})
})

describe('playground code events', () => {
	const formData = { context: SECRET_CONTEXT, keywords: '', languageToTranslate: 'fr', image: null }

	it('sends the language of the tab opened and of the request copied', async () => {
		copyToClipboard.mockResolvedValue(true)
		render(createElement(PlaygroundPreviewCode, { formData }))
		fireEvent.click(screen.getByText('Request Preview'))

		fireEvent.click(screen.getByTestId('tab-curl'))
		fireEvent.click(screen.getByTestId('copy-button'))

		await waitFor(() => expect(events('playground-code-copy')).toEqual([{ language: 'curl', target: 'request' }]))
		expect(events('playground-preview-tab-select')).toEqual([{ language: 'curl' }])
		expect(events('playground-option-toggle')).toEqual([{ action: 'open', option: 'request-preview' }])
		// the copied request holds the context: the event must not
		expect(copyToClipboard.mock.calls[0][0]).toContain(SECRET_CONTEXT)
		expect(everythingSent()).not.toContain('spring sale')
	})

	it('sends nothing when the browser refused the copy', async () => {
		copyToClipboard.mockResolvedValue(false)
		render(createElement(PlaygroundResponse, { response: { title: 'An image' } }))

		fireEvent.click(screen.getByRole('button', { name: 'Copy response' }))

		await waitFor(() => expect(copyToClipboard).toHaveBeenCalledTimes(1))
		expect(events('playground-code-copy')).toEqual([])
	})

	it('sends the copy of the response without the response', async () => {
		copyToClipboard.mockResolvedValue(true)
		render(createElement(PlaygroundResponse, { response: { title: 'A generated title' } }))

		fireEvent.click(screen.getByRole('button', { name: 'Copy response' }))

		await waitFor(() => expect(events('playground-code-copy')).toEqual([{ language: 'json', target: 'response' }]))
		expect(everythingSent()).not.toContain('generated title')
	})
})
