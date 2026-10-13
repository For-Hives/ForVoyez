import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { useUser } from '@clerk/nextjs'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { createElement, StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createUser } from '@/app/actions/app/createUser'
import { LayoutAppComponent } from '@/components/App/LayoutApp.component'
import { setSignedIn } from '@/helpers/analytics'

vi.mock('@clerk/nextjs', () => ({ UserButton: () => null, useUser: vi.fn() }))
vi.mock('@/app/actions/app/createUser', () => ({ createUser: vi.fn() }))
// the navigation and the header are not under test
vi.mock('@/components/App/HeaderApp.component', () => ({
	HeaderDashboard: () => null,
}))
vi.mock('@/components/App/NavigationApp.component', () => ({
	NavigationAppComponent: () => null,
}))
vi.mock('@/components/App/HeroPatternApp.component', () => ({
	HeroPatternAppComponent: () => null,
}))
// `require('package.json')` is resolved by Next's bundler only
vi.mock('@/helpers/version', () => ({ default: 'v0.0.0-test' }))
vi.mock('@/components/App/SectionProviderApp.component', () => ({
	SectionProviderAppComponent: ({ children }) => children,
}))

const EVENT = 'auth-signup-complete'
const SOURCE_DIRECTORY = path.join(process.cwd(), 'src')
const LAYOUT_FILE = path.join('components', 'App', 'LayoutApp.component.js')

// what Clerk loaded in the browser for the visitor: none of it may reach Umami
const ADA = {
	primaryEmailAddress: { emailAddress: 'ada@example.test' },
	id: 'user_2abcDEF123',
	passwordEnabled: true,
	externalAccounts: [],
	lastName: 'Lovelace',
	firstName: 'Ada',
}
const GRACE = {
	externalAccounts: [{ emailAddress: 'grace@example.test', providerUserId: '1234567890', provider: 'google' }],
	primaryEmailAddress: { emailAddress: 'grace@example.test' },
	id: 'user_9zyxWVU987',
	passwordEnabled: false,
	lastName: 'Hopper',
	firstName: 'Grace',
}
const PERSONAL = /Ada|Lovelace|Grace|Hopper|example\.test|user_2abcDEF123|user_9zyxWVU987|1234567890/

const SIGNED_OUT = { isSignedIn: false, isLoaded: true, user: null }
const CLERK_LOADING = { isSignedIn: undefined, isLoaded: false, user: undefined }

function signedIn(user) {
	return { isSignedIn: true, isLoaded: true, user }
}

// test files are not JSX-transformed (only src/ is)
function layout() {
	return createElement(LayoutAppComponent, null, createElement('p', null, 'page content'))
}

function events(name) {
	return window.umami.track.mock.calls.filter(([sent]) => sent === name).map(([, data]) => data)
}

// lets the answer of the server action, and what follows it, happen
function settle() {
	return act(() => new Promise(resolve => setTimeout(resolve, 0)))
}

function sourceFiles(directory = SOURCE_DIRECTORY) {
	return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		const file = path.join(directory, entry.name)
		if (entry.isDirectory()) return entry.name === 'generated' ? [] : sourceFiles(file)
		return /\.(js|jsx|ts|tsx|mjs)$/.test(entry.name) ? [file] : []
	})
}

beforeEach(() => {
	vi.resetAllMocks()
	window.umami = { track: vi.fn() }
})

afterEach(() => {
	cleanup()
	vi.useRealTimers()
	delete window.umami
	setSignedIn(undefined)
})

describe('sign-up event of the dashboard layout', () => {
	it('sends one event when the server action has just created the account', async () => {
		createUser.mockResolvedValue({ created: true })
		useUser.mockReturnValue(signedIn(ADA))

		render(layout())

		await waitFor(() => expect(events(EVENT)).toEqual([{ method: 'email' }]))
		await settle()
		expect(window.umami.track).toHaveBeenCalledTimes(1)
		expect(createUser).toHaveBeenCalledTimes(1)
		expect(screen.getByText('page content')).toBeTruthy()
	})

	it('sends nothing for an account that already existed', async () => {
		createUser.mockResolvedValue({ created: false })
		useUser.mockReturnValue(signedIn(ADA))

		render(layout())

		await waitFor(() => expect(createUser).toHaveBeenCalledTimes(1))
		await settle()
		expect(window.umami.track).not.toHaveBeenCalled()
	})

	it.each([
		['nothing', undefined],
		['null', null],
		['the whole row, as it did before', { clerkId: ADA.id, credits: 0 }],
		['a string instead of a boolean', { created: 'yes' }],
	])('sends nothing when the action answers %s', async (_label, answer) => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		createUser.mockResolvedValue(answer)
		useUser.mockReturnValue(signedIn(ADA))

		render(layout())

		await waitFor(() => expect(createUser).toHaveBeenCalledTimes(1))
		await settle()
		expect(window.umami.track).not.toHaveBeenCalled()
		expect(consoleError).not.toHaveBeenCalled()
		consoleError.mockRestore()
	})

	it('sends nothing, and creates nothing, for a signed-out visitor', async () => {
		createUser.mockResolvedValue({ created: true })
		useUser.mockReturnValue(SIGNED_OUT)

		render(layout())

		await settle()
		expect(createUser).not.toHaveBeenCalled()
		expect(window.umami.track).not.toHaveBeenCalled()
	})

	it('sends nothing while Clerk is loading', async () => {
		createUser.mockResolvedValue({ created: true })
		useUser.mockReturnValue(CLERK_LOADING)

		render(layout())

		await settle()
		expect(createUser).not.toHaveBeenCalled()
		expect(window.umami.track).not.toHaveBeenCalled()
	})

	it('sends nothing when the account could not be created', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		createUser.mockRejectedValue(new Error('database down'))
		useUser.mockReturnValue(signedIn(ADA))

		render(layout())

		await waitFor(() => expect(consoleError).toHaveBeenCalledWith('Error creating the user:', 'database down'))
		await settle()
		expect(window.umami.track).not.toHaveBeenCalled()
		consoleError.mockRestore()
	})
})

describe('one sign-up, one event', () => {
	// Strict Mode runs the effect twice in development: two calls reach the
	// server, which says "created" to the first one only
	it('sends one event when the action is called twice', async () => {
		createUser.mockResolvedValueOnce({ created: true }).mockResolvedValue({ created: false })
		useUser.mockReturnValue(signedIn(ADA))

		render(createElement(StrictMode, null, layout()))

		await waitFor(() => expect(createUser).toHaveBeenCalledTimes(2))
		await settle()
		expect(events(EVENT)).toEqual([{ method: 'email' }])
	})

	it('still sends one event if both calls answered "created"', async () => {
		createUser.mockResolvedValue({ created: true })
		useUser.mockReturnValue(signedIn(ADA))

		render(createElement(StrictMode, null, layout()))

		await waitFor(() => expect(createUser).toHaveBeenCalledTimes(2))
		await settle()
		expect(events(EVENT)).toEqual([{ method: 'email' }])
	})

	it('does not call the action again, nor send again, when the layout renders again', async () => {
		createUser.mockResolvedValue({ created: true })
		useUser.mockReturnValue(signedIn(ADA))

		const { rerender } = render(layout())
		await waitFor(() => expect(events(EVENT)).toHaveLength(1))
		// Clerk hands a new user object after each change of the profile
		useUser.mockReturnValue(signedIn({ ...ADA, firstName: 'Augusta' }))
		rerender(layout())
		rerender(layout())

		await settle()
		expect(createUser).toHaveBeenCalledTimes(1)
		expect(events(EVENT)).toHaveLength(1)
	})

	it('sends the event of an account even when its page is gone before the answer', async () => {
		let answer
		createUser.mockReturnValue(
			new Promise(resolve => {
				answer = resolve
			})
		)
		useUser.mockReturnValue(signedIn(ADA))

		const { unmount } = render(layout())
		await waitFor(() => expect(createUser).toHaveBeenCalledTimes(1))
		unmount()
		answer({ created: true })

		await waitFor(() => expect(events(EVENT)).toEqual([{ method: 'email' }]))
	})

	it('counts a second account that signs up without the page being reloaded', async () => {
		createUser.mockResolvedValue({ created: true })
		useUser.mockReturnValue(signedIn(ADA))

		const { rerender } = render(layout())
		await waitFor(() => expect(events(EVENT)).toHaveLength(1))
		useUser.mockReturnValue(SIGNED_OUT)
		rerender(layout())
		useUser.mockReturnValue(signedIn(GRACE))
		rerender(layout())

		await waitFor(() => expect(events(EVENT)).toEqual([{ method: 'email' }, { method: 'google' }]))
		expect(createUser).toHaveBeenCalledTimes(2)
	})
})

describe('what the sign-up event carries', () => {
	it('says a social sign-up from the provider Clerk already loaded', async () => {
		createUser.mockResolvedValue({ created: true })
		useUser.mockReturnValue(signedIn(GRACE))

		render(layout())

		await waitFor(() => expect(events(EVENT)).toEqual([{ method: 'google' }]))
	})

	it.each([
		['no list of external accounts', { id: 'user_x' }, 'email'],
		['an account without provider', { externalAccounts: [{}], id: 'user_x' }, 'email'],
		['a provider that is not a name', { externalAccounts: [{ provider: '' }], id: 'user_x' }, 'email'],
		['a custom provider', { externalAccounts: [{ provider: 'custom_Acme SSO' }], id: 'user_x' }, 'custom-acme-sso'],
		['an endless provider', { externalAccounts: [{ provider: 'x'.repeat(200) }], id: 'user_x' }, 'x'.repeat(30)],
		['no user at all', undefined, 'email'],
	])('reads %s as a short method', async (_label, user, method) => {
		createUser.mockResolvedValue({ created: true })
		useUser.mockReturnValue(signedIn(user))

		render(layout())

		await waitFor(() => expect(events(EVENT)).toEqual([{ method }]))
	})

	it('adds the signed-in segment and nothing that identifies the visitor', async () => {
		setSignedIn(true)
		createUser.mockResolvedValue({ created: true })
		useUser.mockReturnValue(signedIn(GRACE))

		render(layout())

		await waitFor(() => expect(events(EVENT)).toEqual([{ method: 'google', signed_in: true }]))
		expect(JSON.stringify(window.umami.track.mock.calls)).not.toMatch(PERSONAL)
	})

	it('keeps the page working when the tracker throws', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		window.umami.track.mockImplementation(() => {
			throw new Error('tracker down')
		})
		createUser.mockResolvedValue({ created: true })
		useUser.mockReturnValue(signedIn(ADA))

		render(layout())

		await waitFor(() => expect(window.umami.track).toHaveBeenCalledTimes(1))
		await settle()
		expect(screen.getByText('page content')).toBeTruthy()
		expect(consoleError).not.toHaveBeenCalled()
		consoleError.mockRestore()
	})
})

// The server answers "created" once per account: an event dropped because the
// tracker script was still loading could never be sent again.
describe('sign-up answered before the tracker is loaded', () => {
	beforeEach(() => {
		delete window.umami
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		createUser.mockResolvedValue({ created: true })
		useUser.mockReturnValue(signedIn(ADA))
	})

	function wait(milliseconds) {
		return act(() => vi.advanceTimersByTimeAsync(milliseconds))
	}

	it('sends the event once, when the tracker arrives', async () => {
		render(layout())
		await wait(1000)
		expect(createUser).toHaveBeenCalledTimes(1)

		window.umami = { track: vi.fn() }
		await wait(250)

		expect(window.umami.track.mock.calls).toEqual([[EVENT, { method: 'email' }]])
		await wait(10_000)
		expect(window.umami.track).toHaveBeenCalledTimes(1)
	})

	it('still sends it to a tracker that needed almost 5 seconds', async () => {
		render(layout())
		await wait(4700)

		window.umami = { track: vi.fn() }
		await wait(250)

		expect(window.umami.track.mock.calls).toEqual([[EVENT, { method: 'email' }]])
	})

	// a wait that never ended would send it to this late tracker
	it('gives up after 5 seconds, without an error', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

		render(layout())
		await wait(5000)
		window.umami = { track: vi.fn() }
		await wait(10_000)

		expect(window.umami.track).not.toHaveBeenCalled()
		expect(consoleError).not.toHaveBeenCalled()
		consoleError.mockRestore()
	})

	it('waits for nothing when no account was created', async () => {
		createUser.mockResolvedValue({ created: false })

		render(layout())
		await wait(1000)
		window.umami = { track: vi.fn() }
		await wait(10_000)

		expect(window.umami.track).not.toHaveBeenCalled()
	})
})

describe('the sign-up event in the sources', () => {
	const sources = sourceFiles().map(file => ({
		content: readFileSync(file, 'utf8'),
		file: path.relative(SOURCE_DIRECTORY, file),
	}))

	// tests/unit/components/analyticsEventsMarkup.test.js reads the names of
	// the literal track('…') calls to check them against the convention
	it('is a literal track() call of the dashboard layout, and of nothing else', () => {
		const senders = sources.filter(({ content }) => content.includes(EVENT)).map(({ file }) => file)
		const layoutSource = sources.find(({ file }) => file === LAYOUT_FILE).content

		expect(senders).toEqual([LAYOUT_FILE])
		expect(layoutSource.match(/\btrack\(\s*'[^']*'/g)).toEqual([`track('${EVENT}'`])
	})

	it('is named <area>-<object>-<action> in the auth area, 50 characters at most', () => {
		expect(EVENT).toMatch(/^auth(-[a-z0-9]+){2,}$/)
		expect(EVENT.length).toBeLessThanOrEqual(50)
	})
})
