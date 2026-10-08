import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react'
import { toast, ToastContainer } from 'react-toastify'
import { createElement, Fragment } from 'react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PlansPage from '@/app/(dashboard)/app/plans/page'

import {
	createCheckoutUrl,
	getCustomerPortalUrl,
	getMySubscription,
	listPlans,
} from '@/app/actions/app/plans'

const CHECKOUT_URL = 'https://forvoyez.lemonsqueezy.com/checkout/custom/abc'
const PORTAL_URL = 'https://forvoyez.lemonsqueezy.com/billing?expires=1'
const CHECKOUT_ERROR = 'Could not open the checkout. Please try again.'

const router = { replace: vi.fn(), push: vi.fn() }

vi.mock('next/navigation', () => ({ useRouter: () => router }))
vi.mock('@/app/actions/app/plans', () => ({
	getCustomerPortalUrl: vi.fn(),
	getMySubscription: vi.fn(),
	createCheckoutUrl: vi.fn(),
	listPlans: vi.fn(),
}))

function deferred() {
	let resolve
	const promise = new Promise(_resolve => {
		resolve = _resolve
	})
	return { resolve, promise }
}

function plan(fields) {
	return {
		description: '<p>Plan description</p>',
		features: '["100 credits*/month"]',
		productName: 'ForVoyez',
		buttonText: 'Subscribe',
		variantEnabled: true,
		mostPopular: false,
		price: 390,
		...fields,
	}
}

// with the toast container of the dashboard layout, like in the real page
function renderPlansPage() {
	return render(
		createElement(
			Fragment,
			null,
			createElement(ToastContainer, { position: 'top-right', autoClose: 3000 }),
			createElement(PlansPage)
		)
	)
}

// a new array on each call: both sections sort the plans they receive in place
function storedPlans() {
	return [
		plan({
			billingCycle: 'month',
			variantId: '365926',
			name: 'Starter',
			id: 1,
		}),
		plan({ billingCycle: 'month', variantId: '365931', name: 'Growth', id: 2 }),
		plan({ billingCycle: 'year', variantId: '386222', name: 'Starter', id: 3 }),
		plan({
			productName: 'Credit Refill (Starter)',
			variantId: '379035',
			name: '100 Credits',
			billingCycle: '',
			id: 7,
		}),
		plan({
			productName: 'Credit refill (Growth)',
			name: '1000 Credits',
			variantId: '379040',
			billingCycle: '',
			id: 8,
		}),
	]
}

describe('Plans page checkouts', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		listPlans.mockImplementation(async () => storedPlans())
	})

	afterEach(() => {
		toast.dismiss()
		cleanup()
	})

	describe('for a user without subscription', () => {
		beforeEach(() => {
			getMySubscription.mockResolvedValue(null)
		})

		it('shows the plans without creating any checkout', async () => {
			renderPlansPage()

			expect(
				await screen.findAllByRole('button', { name: 'Subscribe' })
			).toHaveLength(2)
			expect(createCheckoutUrl).not.toHaveBeenCalled()
			expect(getCustomerPortalUrl).not.toHaveBeenCalled()
			expect(screen.queryByText('Refill Plans')).toBeNull()
		})

		it('creates the checkout of the clicked plan only, then goes to it', async () => {
			const checkout = deferred()
			createCheckoutUrl.mockReturnValue(checkout.promise)
			renderPlansPage()

			const button = await screen.findByTestId('subscribe-365931')
			fireEvent.click(button)

			// pending: same text, but busy and not clickable twice
			expect(button.disabled).toBe(true)
			expect(button.getAttribute('aria-busy')).toBe('true')
			expect(button.textContent).toBe('Subscribe')
			fireEvent.click(button)
			expect(createCheckoutUrl).toHaveBeenCalledTimes(1)
			expect(createCheckoutUrl).toHaveBeenCalledWith('365931')

			checkout.resolve(CHECKOUT_URL)
			await waitFor(() =>
				expect(router.push).toHaveBeenCalledWith(CHECKOUT_URL)
			)
		})

		it('releases the button when the browser restores the page from its cache', async () => {
			createCheckoutUrl.mockResolvedValue(CHECKOUT_URL)
			renderPlansPage()

			const button = await screen.findByTestId('subscribe-365926')
			fireEvent.click(button)
			await waitFor(() =>
				expect(router.push).toHaveBeenCalledWith(CHECKOUT_URL)
			)
			expect(button.disabled).toBe(true)

			const pageShow = new Event('pageshow')
			Object.defineProperty(pageShow, 'persisted', { value: true })
			fireEvent(window, pageShow)

			expect(button.disabled).toBe(false)
			expect(button.getAttribute('aria-busy')).toBe('false')
		})

		it('shows a toast and frees the button when the checkout fails', async () => {
			const consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {})
			createCheckoutUrl.mockRejectedValue(new Error('Lemon Squeezy is down'))
			renderPlansPage()

			const button = await screen.findByTestId('subscribe-365926')
			fireEvent.click(button)

			expect(await screen.findByText(CHECKOUT_ERROR)).toBeTruthy()
			await waitFor(() => expect(button.disabled).toBe(false))
			expect(router.push).not.toHaveBeenCalled()
			consoleErrorSpy.mockRestore()
		})
	})

	describe('for a subscriber', () => {
		beforeEach(() => {
			getMySubscription.mockResolvedValue({
				plan: { name: 'Growth' },
				planId: 2,
			})
		})

		it('never offers "Subscribe" while the customer portal loads', async () => {
			const portal = deferred()
			getCustomerPortalUrl.mockReturnValue(portal.promise)
			renderPlansPage()

			await screen.findByRole('button', { name: 'Refill your credits' })
			expect(screen.getByTestId('plans-loading')).toBeTruthy()
			expect(screen.queryByRole('button', { name: 'Subscribe' })).toBeNull()

			portal.resolve(PORTAL_URL)
			const manage = await screen.findByRole('link', {
				name: 'Manage my Subscription',
			})
			expect(manage.getAttribute('href')).toBe(PORTAL_URL)
			expect(
				screen.getByRole('link', { name: 'Change Plan' }).getAttribute('href')
			).toBe(PORTAL_URL)
			expect(screen.queryByRole('button', { name: 'Subscribe' })).toBeNull()
		})

		it('creates the refill checkout only when its button is clicked', async () => {
			getCustomerPortalUrl.mockResolvedValue(PORTAL_URL)
			createCheckoutUrl.mockResolvedValue(CHECKOUT_URL)
			renderPlansPage()

			await screen.findByRole('link', { name: 'Manage my Subscription' })
			const refills = screen.getAllByRole('button', {
				name: 'Refill your credits',
			})
			// only the refills of the subscribed product
			expect(refills).toHaveLength(1)
			expect(createCheckoutUrl).not.toHaveBeenCalled()

			fireEvent.click(refills[0])

			await waitFor(() =>
				expect(router.push).toHaveBeenCalledWith(CHECKOUT_URL)
			)
			expect(createCheckoutUrl).toHaveBeenCalledTimes(1)
			expect(createCheckoutUrl).toHaveBeenCalledWith('379040')
		})
	})
})
