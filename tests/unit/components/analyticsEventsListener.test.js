import { useAuth } from '@clerk/nextjs'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement, useState } from 'react'
import { flushSync } from 'react-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalyticsEventsComponent } from '@/components/Analytics/AnalyticsEvents.component'
import { setSignedIn } from '@/helpers/analytics'

vi.mock('@clerk/nextjs', () => ({ useAuth: vi.fn() }))

// the listener next to a page, like in the root layout
function renderWithListener(...children) {
	return render(createElement('div', null, createElement(AnalyticsEventsComponent), ...children))
}

beforeEach(() => {
	// Clerk has not answered yet
	useAuth.mockReturnValue({ isLoaded: false, isSignedIn: undefined })
	window.umami = { track: vi.fn() }
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	delete window.umami
	setSignedIn(undefined)
})

describe('analytics click listener', () => {
	it('renders nothing', () => {
		const { container } = render(createElement(AnalyticsEventsComponent))

		expect(container.innerHTML).toBe('')
	})

	it('sends the event of the clicked element with its properties', () => {
		renderWithListener(
			createElement(
				'a',
				{
					href: '#pricing',
					'data-fv-event': 'pricing-plan-click',
					'data-fv-event-plan': 'growth',
					'data-fv-event-cycle': 'annually',
					'data-fv-event-location': 'landing',
					'data-testid': 'plan-button',
				},
				'Subscribe'
			)
		)

		fireEvent.click(screen.getByText('Subscribe'))

		expect(window.umami.track).toHaveBeenCalledTimes(1)
		expect(window.umami.track).toHaveBeenCalledWith('pricing-plan-click', {
			plan: 'growth',
			cycle: 'annually',
			location: 'landing',
		})
	})

	it('finds the event from a node nested in the tracked element', () => {
		renderWithListener(
			createElement(
				'button',
				{ type: 'button', 'data-fv-event': 'nav-menu-toggle', 'data-fv-event-action': 'open' },
				createElement('span', null, createElement('svg', { 'data-testid': 'icon' }))
			)
		)

		fireEvent.click(screen.getByTestId('icon'))

		expect(window.umami.track).toHaveBeenCalledWith('nav-menu-toggle', { action: 'open' })
	})

	it('sends an event without property as a name alone', () => {
		renderWithListener(createElement('button', { type: 'button', 'data-fv-event': 'tokens-create-click' }, 'Add token'))

		fireEvent.click(screen.getByText('Add token'))

		expect(window.umami.track).toHaveBeenCalledWith('tokens-create-click', undefined)
	})

	it('ignores clicks outside any tracked element', () => {
		renderWithListener(
			createElement('button', { type: 'button', 'data-testid': 'plain' }, 'Plain'),
			createElement('a', { href: '#x', 'data-fv-event': '' }, 'Empty name')
		)

		fireEvent.click(screen.getByText('Plain'))
		fireEvent.click(screen.getByText('Empty name'))
		fireEvent.click(document.body)

		expect(window.umami.track).not.toHaveBeenCalled()
	})

	// Umami's own data-umami-event cancels the click on a link, which is what
	// breaks next/link: ours must leave the click alone
	it('never prevents the default action of the click', () => {
		const reactHandler = vi.fn()
		renderWithListener(
			createElement(
				'a',
				{
					href: '#features',
					onClick: reactHandler,
					'data-fv-event': 'nav-link-click',
					'data-fv-event-target': 'features',
				},
				'Features'
			)
		)
		const preventDefault = vi.spyOn(Event.prototype, 'preventDefault')
		const stopPropagation = vi.spyOn(Event.prototype, 'stopPropagation')
		const stopImmediatePropagation = vi.spyOn(Event.prototype, 'stopImmediatePropagation')

		// fireEvent returns false when a listener called preventDefault
		const notCancelled = fireEvent.click(screen.getByText('Features'))

		expect(window.umami.track).toHaveBeenCalledWith('nav-link-click', { target: 'features' })
		expect(notCancelled).toBe(true)
		expect(preventDefault).not.toHaveBeenCalled()
		expect(stopPropagation).not.toHaveBeenCalled()
		expect(stopImmediatePropagation).not.toHaveBeenCalled()
		expect(reactHandler).toHaveBeenCalledTimes(1)
	})

	it('listens on the document in the bubble phase, and stops when unmounted', () => {
		const add = vi.spyOn(document, 'addEventListener')
		const remove = vi.spyOn(document, 'removeEventListener')

		const { unmount } = renderWithListener(
			createElement('button', { type: 'button', 'data-fv-event': 'tokens-create-click' }, 'Add token')
		)

		const clickListeners = add.mock.calls.filter(([type]) => type === 'click')
		expect(clickListeners).toHaveLength(1)
		// no third argument: neither `true` nor { capture: true }
		expect(clickListeners[0]).toHaveLength(2)
		const [, listener] = clickListeners[0]

		const button = screen.getByText('Add token')
		unmount()
		document.body.append(button)
		button.click()

		expect(remove).toHaveBeenCalledWith('click', listener)
		expect(window.umami.track).not.toHaveBeenCalled()
		button.remove()
	})

	it('runs after the handlers of the page: a handler that stops the click is respected', () => {
		renderWithListener(
			createElement(
				'div',
				{ ref: node => node?.addEventListener('click', event => event.stopPropagation()) },
				createElement('button', { type: 'button', 'data-fv-event': 'tokens-create-click' }, 'Stopped')
			)
		)

		fireEvent.click(screen.getByText('Stopped'))

		expect(window.umami.track).not.toHaveBeenCalled()
	})

	// in a browser React commits before the document listener runs: flushSync
	// reproduces it, the clicked icon is already detached from its button
	it('keeps the event of a button whose icon is replaced by its own click', () => {
		function Toggle() {
			const [open, setOpen] = useState(false)
			return createElement(
				'button',
				{ type: 'button', onClick: () => flushSync(() => setOpen(!open)), 'data-fv-event': 'dash-menu-toggle' },
				open
					? createElement('svg', { key: 'close', 'data-testid': 'close-icon' })
					: createElement('svg', { key: 'menu', 'data-testid': 'menu-icon' })
			)
		}
		renderWithListener(createElement(Toggle))

		fireEvent.click(screen.getByTestId('menu-icon'))

		expect(screen.queryByTestId('menu-icon')).toBeNull()
		expect(window.umami.track).toHaveBeenCalledWith('dash-menu-toggle', undefined)
	})

	it('does nothing, and breaks nothing, without the Umami tracker', () => {
		delete window.umami
		const onClick = vi.fn()
		renderWithListener(
			createElement('button', { type: 'button', onClick, 'data-fv-event': 'tokens-create-click' }, 'Add token')
		)

		expect(() => fireEvent.click(screen.getByText('Add token'))).not.toThrow()
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it('survives a tracker that throws', () => {
		window.umami.track.mockImplementation(() => {
			throw new Error('tracker crashed')
		})
		renderWithListener(createElement('button', { type: 'button', 'data-fv-event': 'tokens-create-click' }, 'Add token'))

		expect(() => fireEvent.click(screen.getByText('Add token'))).not.toThrow()
	})
})

describe('signed_in from Clerk', () => {
	function clickTrackedLink() {
		renderWithListener(
			createElement(
				'a',
				{ href: '#x', 'data-fv-event': 'nav-link-click', 'data-fv-event-target': 'pricing' },
				'Pricing'
			)
		)
		fireEvent.click(screen.getByText('Pricing'))
		return window.umami.track.mock.calls[0]
	}

	it('is not sent while Clerk is loading', () => {
		expect(clickTrackedLink()).toEqual(['nav-link-click', { target: 'pricing' }])
	})

	it('is true for a signed-in visitor, without any identifier', () => {
		useAuth.mockReturnValue({ isLoaded: true, isSignedIn: true, userId: 'user_2abcDEF', sessionId: 'sess_123' })

		const [name, data] = clickTrackedLink()

		expect(name).toBe('nav-link-click')
		expect(data).toEqual({ target: 'pricing', signed_in: true })
		expect(JSON.stringify(data)).not.toMatch(/user_2abcDEF|sess_123/)
	})

	it('is false for a signed-out visitor', () => {
		useAuth.mockReturnValue({ isLoaded: true, isSignedIn: false, userId: null })

		expect(clickTrackedLink()).toEqual(['nav-link-click', { target: 'pricing', signed_in: false }])
	})

	it('never calls umami.identify', () => {
		window.umami.identify = vi.fn()
		useAuth.mockReturnValue({ isLoaded: true, isSignedIn: true, userId: 'user_2abcDEF' })

		clickTrackedLink()

		expect(window.umami.identify).not.toHaveBeenCalled()
	})
})
