import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { toast } from 'react-toastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendEmail } from '@/app/actions/contact/sendEmail'
import { ContactComponent } from '@/components/Contact/Contact.component'

vi.mock('@/app/actions/contact/sendEmail', () => ({ sendEmail: vi.fn() }))
vi.mock('react-toastify', () => ({ toast: vi.fn() }))

function fillContact() {
	for (const [label, value] of [
		['First name', 'Élodie'],
		['Last name', 'Dupont'],
		['Email', 'elodie@example.test'],
		['Message', 'Bonjour\n漢字'],
	]) {
		fireEvent.change(screen.getByLabelText(`${label} *`), { target: { value } })
	}
}

beforeEach(() => vi.resetAllMocks())
afterEach(() => cleanup())

describe('contact form input and submission boundaries', () => {
	it('validates empty required fields before contacting the server', async () => {
		render(createElement(ContactComponent))
		fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
		expect(await screen.findByText('First name is required')).toBeTruthy()
		expect(screen.getByText('Last name is required')).toBeTruthy()
		expect(screen.getByText('Email is required')).toBeTruthy()
		expect(screen.getByText('Message is required')).toBeTruthy()
		expect(sendEmail).not.toHaveBeenCalled()
	})

	it('validates malformed email input', async () => {
		render(createElement(ContactComponent))
		fillContact()
		fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'invalid' } })
		fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form'))
		expect(await screen.findByText('Invalid email')).toBeTruthy()
		expect(sendEmail).not.toHaveBeenCalled()
	})

	it('preserves unicode and multiline messages, prevents duplicate submits, then resets', async () => {
		let resolve
		sendEmail.mockReturnValue(
			new Promise(done => {
				resolve = done
			})
		)
		render(createElement(ContactComponent))
		fillContact()
		const submit = screen.getByRole('button', { name: 'Send message' })
		fireEvent.click(submit)
		await waitFor(() => expect(sendEmail).toHaveBeenCalledTimes(1))
		expect(submit.disabled).toBe(true)
		fireEvent.click(submit)
		expect(sendEmail).toHaveBeenCalledTimes(1)
		expect(sendEmail.mock.calls[0][0]).toMatchObject({ 'first-name': 'Élodie', message: 'Bonjour\n漢字' })
		resolve({ success: true })
		await waitFor(() => expect(toast).toHaveBeenCalledWith('Message sent successfully!', expect.any(Object)))
		expect(screen.getByLabelText('Message *').value).toBe('')
	})

	it.each([false, true])('retains customer input after a server failure (rejected: %j)', async rejected => {
		if (rejected) sendEmail.mockRejectedValue(new Error('connection failed'))
		else sendEmail.mockResolvedValue({ success: false, details: 'Service unavailable' })
		render(createElement(ContactComponent))
		fillContact()
		fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
		await waitFor(() =>
			expect(toast).toHaveBeenCalledWith(expect.stringContaining('An error occurred'), expect.any(Object))
		)
		expect(screen.getByLabelText('Message *').value).toBe('Bonjour\n漢字')
		expect(screen.getByRole('button', { name: 'Send message' }).disabled).toBe(false)
	})
})
