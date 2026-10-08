import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUser } from '@clerk/nextjs'

import { LayoutAppComponent } from '@/components/App/LayoutApp.component'
import { createUser } from '@/app/actions/app/createUser'

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

// test files are not JSX-transformed (only src/ is)
function layout() {
	return createElement(
		LayoutAppComponent,
		null,
		createElement('p', null, 'page content')
	)
}

function renderLayout() {
	return render(layout())
}

describe('LayoutAppComponent', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		createUser.mockResolvedValue({ clerkId: 'user_1' })
	})

	afterEach(() => {
		cleanup()
	})

	// /app/legals/* use this layout and are public: the createUser server
	// action answered 500 to every signed-out visitor
	it('does not create a user for a signed-out visitor', async () => {
		useUser.mockReturnValue({ isSignedIn: false, isLoaded: true, user: null })

		renderLayout()

		expect(screen.getByText('page content')).toBeTruthy()
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(createUser).not.toHaveBeenCalled()
	})

	it('waits for Clerk before creating the user', async () => {
		useUser.mockReturnValue({ isSignedIn: undefined, isLoaded: false })

		renderLayout()

		await new Promise(resolve => setTimeout(resolve, 0))
		expect(createUser).not.toHaveBeenCalled()
	})

	it('creates the user of a signed-in visitor once', async () => {
		useUser.mockReturnValue({
			user: { lastName: 'Lovelace', firstName: 'Ada', id: 'user_1' },
			isSignedIn: true,
			isLoaded: true,
		})

		const { rerender } = renderLayout()
		rerender(layout())

		await waitFor(() => expect(createUser).toHaveBeenCalledTimes(1))
	})

	it('does not leave a failed createUser as an unhandled rejection', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		createUser.mockRejectedValue(new Error('database down'))
		useUser.mockReturnValue({
			user: { lastName: 'Lovelace', firstName: 'Ada', id: 'user_1' },
			isSignedIn: true,
			isLoaded: true,
		})

		renderLayout()

		await waitFor(() =>
			expect(consoleError).toHaveBeenCalledWith(
				'Error creating the user:',
				'database down'
			)
		)
		consoleError.mockRestore()
	})
})
