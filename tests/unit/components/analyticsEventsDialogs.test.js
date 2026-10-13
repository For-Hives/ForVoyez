import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Dialog } from '@headlessui/react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAllToken } from '@/app/actions/tokens/TokensCRUD'
import { AnalyticsEventsComponent } from '@/components/Analytics/AnalyticsEvents.component'
import { NavbarComponent } from '@/components/Navbar.component'
import TokenList from '@/components/Tokens/TokenList'
import { setSignedIn, trackClick } from '@/helpers/analytics'

// A Headless UI <Dialog.Panel> is rendered in a portal and stops the clicks
// made inside it: they never reach the listener of the document. Each panel
// forwards them itself with onClick={trackClick}.

vi.mock('@clerk/nextjs', () => ({
	Show: ({ children }) => children,
	SignInButton: ({ children }) => children,
	UserButton: () => null,
	useAuth: () => ({ isLoaded: false }),
}))
vi.mock('@/app/actions/tokens/TokensCRUD', () => ({ createToken: vi.fn(), deleteToken: vi.fn(), getAllToken: vi.fn() }))
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const SOURCE_DIRECTORY = path.join(process.cwd(), 'src')

function sourceFiles(directory = SOURCE_DIRECTORY) {
	return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		const file = path.join(directory, entry.name)
		if (entry.isDirectory()) return entry.name === 'generated' ? [] : sourceFiles(file)
		return entry.name.endsWith('.js') ? [file] : []
	})
}

function withListener(...children) {
	return createElement('div', null, createElement(AnalyticsEventsComponent), ...children)
}

function panel(props, ...children) {
	return createElement(
		Dialog,
		{ open: true, onClose: () => {} },
		createElement(Dialog.Panel, props, createElement('h2', null, 'A dialog'), ...children)
	)
}

beforeEach(() => {
	vi.resetAllMocks()
	window.umami = { track: vi.fn() }
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
	delete window.umami
	setSignedIn(undefined)
})

describe('clicks inside a Headless UI dialog panel', () => {
	it('are sent once when the panel forwards them', () => {
		const onClick = vi.fn()
		render(
			withListener(
				panel(
					{ onClick: trackClick },
					createElement(
						'button',
						{ type: 'button', onClick, 'data-fv-event': 'tokens-modal-close', 'data-fv-event-via': 'cancel' },
						'Cancel'
					)
				)
			)
		)

		fireEvent.click(screen.getByText('Cancel'))

		expect(window.umami.track.mock.calls).toEqual([['tokens-modal-close', { via: 'cancel' }]])
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	// next/link cancels the click it handles: Headless UI then lets it through,
	// and it reaches the document as well
	it('are sent once, not twice, when the click also reaches the document', () => {
		render(
			withListener(
				panel(
					{ onClick: trackClick },
					createElement(
						'a',
						{
							href: '#contact',
							onClick: event => event.preventDefault(),
							'data-fv-event': 'nav-link-click',
							'data-fv-event-target': 'contact',
						},
						'Contact'
					)
				)
			)
		)

		fireEvent.click(screen.getByText('Contact'))

		expect(window.umami.track.mock.calls).toEqual([['nav-link-click', { target: 'contact' }]])
	})

	it('send nothing for a click on something that is not tracked', () => {
		render(withListener(panel({ onClick: trackClick }, createElement('button', { type: 'button' }, 'Plain'))))

		fireEvent.click(screen.getByText('Plain'))
		fireEvent.click(screen.getByText('A dialog'))

		expect(window.umami.track).not.toHaveBeenCalled()
	})

	it('are forwarded by every dialog panel of the app', () => {
		const panels = sourceFiles().flatMap(file =>
			[...readFileSync(file, 'utf8').matchAll(/<Dialog\.Panel\b[^>]*>/g)].map(([tag]) => ({
				file: path.relative(SOURCE_DIRECTORY, file),
				forwards: tag.includes('onClick={trackClick}'),
			}))
		)

		expect(panels.length).toBeGreaterThanOrEqual(4)
		expect(panels.filter(({ forwards }) => !forwards)).toEqual([])
	})
})

describe('mobile menu of the marketing pages', () => {
	it('tracks the buttons of the dialog, the one that closes it included', async () => {
		render(withListener(createElement(NavbarComponent)))

		fireEvent.click(screen.getByTestId('menu-open-button'))
		const dialog = await screen.findByTestId('mobile-menu-dialog')
		fireEvent.click(within(dialog).getByTestId('sign-in-button'))
		fireEvent.click(within(dialog).getByTestId('menu-close-button'))

		await waitFor(() => expect(screen.queryByTestId('mobile-menu-dialog')).toBeNull())
		expect(window.umami.track.mock.calls).toEqual([
			['nav-menu-toggle', { action: 'open' }],
			['nav-sign-in-click', { location: 'mobile-menu' }],
			['nav-menu-toggle', { action: 'close' }],
		])
	})

	it('marks the links of the dialog as mobile ones', async () => {
		render(withListener(createElement(NavbarComponent)))
		fireEvent.click(screen.getByTestId('menu-open-button'))
		const dialog = await screen.findByTestId('mobile-menu-dialog')

		const links = [...dialog.querySelectorAll('[data-fv-event="nav-link-click"]')].map(link => [
			link.getAttribute('data-fv-event-location'),
			link.getAttribute('data-fv-event-target'),
		])

		expect(links).toEqual(
			expect.arrayContaining([
				['mobile-menu', 'logo'],
				['mobile-menu', 'home'],
				['mobile-menu', 'features'],
				['mobile-menu', 'pricing'],
				['mobile-menu', 'wordpress-plugin'],
				['mobile-menu', 'contact'],
				['mobile-menu', 'app'],
			])
		)
		// a link added to the menu later is tracked like the others
		expect(links.every(([location, target]) => location === 'mobile-menu' && target)).toBe(true)
		expect(dialog.querySelectorAll('a:not([data-fv-event])')).toHaveLength(0)
	})
})

describe('API key dialogs', () => {
	it('tracks the opening of the creation dialog and its Cancel button', async () => {
		getAllToken.mockResolvedValue([])
		render(withListener(createElement(TokenList)))

		fireEvent.click(await screen.findByRole('button', { name: 'Add token' }))
		fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

		expect(window.umami.track.mock.calls).toEqual([
			['tokens-create-click', undefined],
			['tokens-modal-close', { modal: 'create', via: 'cancel' }],
		])
	})

	it('tracks the Cancel button of the revocation dialog, without the key', async () => {
		getAllToken.mockResolvedValue([
			{
				id: 'key-1',
				name: 'Client website key',
				jwt: 'heade*****ature',
				createdAt: '2026-01-01',
				expiredAt: '2030-01-01',
			},
		])
		render(withListener(createElement(TokenList)))

		fireEvent.click(await screen.findByTestId('delete-token-button-0'))
		fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancel' }))

		expect(window.umami.track.mock.calls).toEqual([
			['tokens-delete-click', undefined],
			['tokens-modal-close', { modal: 'delete', via: 'cancel' }],
		])
		expect(JSON.stringify(window.umami.track.mock.calls)).not.toMatch(/key-1|Client website|heade/)
	})
})
