import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { createElement, Fragment, StrictMode } from 'react'
import { ToastContainer, toast } from 'react-toastify'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BillingPage from '@/app/(dashboard)/app/billing/page'

import { getCustomerPortalUrl } from '@/app/actions/app/plans'

const NOT_SUBSCRIBED_MESSAGE = 'You must have been subscribed at least once to access this page.'
const PORTAL_URL = 'https://forvoyez.lemonsqueezy.com/billing?expires=1'

const router = { replace: vi.fn(), push: vi.fn() }

vi.mock('next/navigation', () => ({ useRouter: () => router }))
vi.mock('@/app/actions/app/plans', () => ({ getCustomerPortalUrl: vi.fn() }))

// The real toast container of the dashboard layout, so the assertions check
// what the user (and the Playwright e2e test) actually sees.
function renderBillingPage({ strict = false } = {}) {
	const tree = createElement(
		Fragment,
		null,
		createElement(ToastContainer, { position: 'top-right', autoClose: 3000 }),
		createElement(BillingPage)
	)
	return render(strict ? createElement(StrictMode, null, tree) : tree)
}

describe('Billing page', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	afterEach(() => {
		toast.dismiss()
		cleanup()
	})

	it('tells a user who never bought anything why, and sends them to the plans', async () => {
		// no Lemon Squeezy customer: the action resolves null, it does not throw
		getCustomerPortalUrl.mockResolvedValue(null)
		renderBillingPage()

		const alert = await screen.findByRole('alert')
		expect(alert.textContent).toContain(NOT_SUBSCRIBED_MESSAGE)
		expect(router.push).toHaveBeenCalledWith('/app/plans')
		expect(router.replace).not.toHaveBeenCalled()
	})

	it('shows a single toast when the effect runs twice (React strict mode)', async () => {
		getCustomerPortalUrl.mockResolvedValue(null)
		renderBillingPage({ strict: true })

		await waitFor(() => expect(router.push).toHaveBeenCalledTimes(2))
		expect(await screen.findAllByRole('alert')).toHaveLength(1)
	})

	it('opens the Lemon Squeezy customer portal of a customer', async () => {
		getCustomerPortalUrl.mockResolvedValue(PORTAL_URL)
		renderBillingPage()

		await waitFor(() => expect(router.replace).toHaveBeenCalledWith(PORTAL_URL))
		expect(await screen.findByText('Redirecting to your billing home...')).toBeTruthy()
		expect(router.push).not.toHaveBeenCalled()
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('still explains and redirects to the plans when the portal lookup fails', async () => {
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		getCustomerPortalUrl.mockRejectedValue(new Error('Lemon Squeezy is down'))
		renderBillingPage()

		const alert = await screen.findByRole('alert')
		expect(alert.textContent).toContain(NOT_SUBSCRIBED_MESSAGE)
		expect(router.push).toHaveBeenCalledWith('/app/plans')
		expect(router.replace).not.toHaveBeenCalled()
		expect(await screen.findByText('Failed to load data. Please try again later.')).toBeTruthy()
		consoleErrorSpy.mockRestore()
	})
})
