import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BillingPage from '@/app/(dashboard)/app/billing/page'
import PlansPage from '@/app/(dashboard)/app/plans/page'
import { createCheckoutUrl, getCustomerPortalUrl, getMySubscription, listPlans } from '@/app/actions/app/plans'
import { getMyCredits, getMyUsage, getMyUsageByToken } from '@/app/actions/app/usage'
import { createToken, deleteToken, getAllToken } from '@/app/actions/tokens/TokensCRUD'
import { MobileNavigationAppComponent, useMobileNavigationStore } from '@/components/App/MobileNavigationApp.component'
import { PricingComponent } from '@/components/Landing/Pricing/Pricing.component'
import TokenList from '@/components/Tokens/TokenList'
import { UsageChartComponent } from '@/components/usage/usageChart.component'
import { FaqPluginComponent } from '@/components/WordpressPlugin/FaqPlugin.component'
import { setSignedIn } from '@/helpers/analytics'
import copyToClipboard from '@/helpers/copyToClipboard'

const CHECKOUT_URL = 'https://forvoyez.lemonsqueezy.com/checkout/custom/abc?signature=secret'
const PORTAL_URL = 'https://forvoyez.lemonsqueezy.com/billing?expires=1&signature=secret'
const KEY_NAME = 'Client website key'
const KEY_VALUE = 'header.payload.signature-of-a-brand-new-key'

const router = { replace: vi.fn(), push: vi.fn() }
// one instance: the mobile menu closes itself when the search params change
const searchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
	// not a page of the sidebar: its highlight needs the section store of the layout
	usePathname: () => '/profile',
	useRouter: () => router,
	useSearchParams: () => searchParams,
}))
vi.mock('@clerk/nextjs', () => ({
	UserButton: () => null,
	useAuth: () => ({ userId: 'user_2abcDEF' }),
	useUser: () => ({ user: null }),
}))
vi.mock('@/app/actions/app/plans', () => ({
	createCheckoutUrl: vi.fn(),
	getCustomerPortalUrl: vi.fn(),
	getMySubscription: vi.fn(),
	listPlans: vi.fn(),
}))
vi.mock('@/app/actions/app/usage', () => ({ getMyCredits: vi.fn(), getMyUsage: vi.fn(), getMyUsageByToken: vi.fn() }))
vi.mock('@/app/actions/tokens/TokensCRUD', () => ({ createToken: vi.fn(), deleteToken: vi.fn(), getAllToken: vi.fn() }))
vi.mock('@/helpers/copyToClipboard', () => ({ default: vi.fn() }))
vi.mock('react-toastify', () => ({
	ToastContainer: () => null,
	toast: Object.assign(vi.fn(), { error: vi.fn(), info: vi.fn(), isActive: vi.fn(), success: vi.fn() }),
}))
// charts need a layout jsdom does not have
vi.mock('recharts', () => {
	const Empty = () => null
	return {
		Area: Empty,
		AreaChart: Empty,
		Bar: Empty,
		BarChart: Empty,
		CartesianGrid: Empty,
		Legend: Empty,
		ResponsiveContainer: Empty,
		Tooltip: Empty,
		XAxis: Empty,
		YAxis: Empty,
	}
})

function plan(fields) {
	return {
		buttonText: 'Subscribe',
		description: '<p>Plan description</p>',
		features: '[]',
		mostPopular: false,
		price: 390,
		productName: 'ForVoyez',
		variantEnabled: true,
		...fields,
	}
}

// a new array on each call: the components sort the plans they receive in place
function storedPlans() {
	return [
		plan({ billingCycle: 'month', id: 1, name: 'Starter', packageSize: 250, variantId: '365926' }),
		plan({ billingCycle: 'month', id: 2, name: 'Growth', packageSize: 2500, price: 2900, variantId: '365931' }),
		plan({ billingCycle: 'year', id: 3, name: 'Starter', packageSize: 3000, price: 3900, variantId: '386222' }),
		plan({ billingCycle: 'year', id: 4, name: 'Growth', packageSize: 30_000, price: 29_000, variantId: '386223' }),
		plan({
			billingCycle: null,
			id: 5,
			name: '1000 Credits',
			productName: 'Credit refill (Growth)',
			variantId: '400002',
		}),
	]
}

function events(name) {
	return window.umami.track.mock.calls.filter(([sent]) => sent === name).map(([, data]) => data)
}

function everythingSent() {
	return JSON.stringify(window.umami.track.mock.calls)
}

function eventAttributes(element) {
	return Object.fromEntries(
		[...element.attributes]
			.filter(attribute => attribute.name.startsWith('data-fv-event'))
			.map(attribute => [attribute.name, attribute.value])
	)
}

beforeEach(() => {
	vi.resetAllMocks()
	window.umami = { track: vi.fn() }
	listPlans.mockImplementation(() => Promise.resolve(storedPlans()))
	getMySubscription.mockResolvedValue(null)
	getCustomerPortalUrl.mockResolvedValue(null)
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
	useMobileNavigationStore.setState({ isOpen: false })
})

describe('landing pricing events', () => {
	it('marks each plan button with its plan, cycle and location', async () => {
		render(createElement(PricingComponent))

		expect(eventAttributes(await screen.findByTestId('plan-button-2'))).toEqual({
			'data-fv-event': 'pricing-plan-click',
			'data-fv-event-cycle': 'monthly',
			'data-fv-event-location': 'landing',
			'data-fv-event-plan': 'growth',
		})
		expect(screen.getByTestId('plan-button-2').getAttribute('href')).toBe('/app/plans')
		expect(eventAttributes(screen.getByTestId('contact-us'))).toEqual({
			'data-fv-event': 'pricing-contact-click',
			'data-fv-event-location': 'landing',
		})
	})

	it('sends one event per change of billing cycle, with how it was changed', async () => {
		render(createElement(PricingComponent))
		await screen.findByTestId('plan-button-1')

		fireEvent.click(screen.getByTestId('frequency-annually'))
		// already selected: nothing changes, nothing is sent
		fireEvent.click(screen.getByTestId('frequency-annually'))
		fireEvent.click(screen.getByTestId('frequency-monthly'))
		fireEvent.click(screen.getAllByTestId('get-more-tokens')[0])

		expect(events('pricing-cycle-toggle')).toEqual([
			{ cycle: 'annually', location: 'landing', via: 'toggle' },
			{ cycle: 'monthly', location: 'landing', via: 'toggle' },
			{ cycle: 'annually', location: 'landing', via: 'pay-annually' },
		])
		// the yearly plans are shown: the buttons follow the cycle
		expect(screen.getByTestId('plan-button-4').getAttribute('data-fv-event-cycle')).toBe('annually')
	})
})

describe('plans that cannot be loaded', () => {
	it.each([
		['landing', PricingComponent],
		['plans', PlansPage],
	])('are reported from the %s pricing table', async (location, component) => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		listPlans.mockRejectedValue(new Error('database unreachable'))

		render(createElement(component))

		await waitFor(() => expect(events('pricing-plans-error')).toEqual([{ location }]))
		expect(everythingSent()).not.toContain('database unreachable')
		vi.restoreAllMocks()
	})
})

describe('/app/plans events', () => {
	it('sends the click on a plan, then that the checkout came back, without its URL', async () => {
		createCheckoutUrl.mockResolvedValue(CHECKOUT_URL)
		render(createElement(PlansPage))

		fireEvent.click(await screen.findByTestId('subscribe-365931'))

		const subscription = { cycle: 'monthly', kind: 'subscription', plan: 'growth' }
		await waitFor(() => expect(events('plans-checkout-result')).toEqual([{ ...subscription, outcome: 'ok' }]))
		expect(events('plans-checkout-click')).toEqual([subscription])
		expect(router.push).toHaveBeenCalledWith(CHECKOUT_URL)
		expect(everythingSent()).not.toMatch(/lemonsqueezy|signature|365931|user_2abcDEF/)
	})

	it('sends an error result when no checkout could be created', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		createCheckoutUrl.mockRejectedValue(new Error('Lemon Squeezy is down'))
		render(createElement(PlansPage))
		fireEvent.click(await screen.findByTestId('frequency-option-annually'))

		fireEvent.click(await screen.findByTestId('subscribe-386222'))

		const subscription = { cycle: 'annually', kind: 'subscription', plan: 'starter' }
		await waitFor(() => expect(events('plans-checkout-result')).toEqual([{ ...subscription, outcome: 'error' }]))
		expect(events('plans-checkout-click')).toEqual([subscription])
		expect(events('pricing-cycle-toggle')).toEqual([{ cycle: 'annually', location: 'plans', via: 'toggle' }])
		expect(router.push).not.toHaveBeenCalled()
		expect(everythingSent()).not.toContain('Lemon Squeezy is down')
		vi.restoreAllMocks()
	})

	it('tells a refill from a subscription, and marks the portal links of a subscriber', async () => {
		getMySubscription.mockResolvedValue({ planId: 2, plan: { name: 'Growth' } })
		getCustomerPortalUrl.mockResolvedValue(PORTAL_URL)
		createCheckoutUrl.mockResolvedValue(CHECKOUT_URL)
		render(createElement(PlansPage))

		fireEvent.click(await screen.findByRole('button', { name: 'Refill your credits' }))

		const refill = { cycle: 'one-time', kind: 'refill', plan: '1000-credits' }
		await waitFor(() => expect(events('plans-checkout-result')).toEqual([{ ...refill, outcome: 'ok' }]))
		expect(events('plans-checkout-click')).toEqual([refill])

		const manage = await screen.findByTestId('manage-subscription-2')
		expect(eventAttributes(manage)).toEqual({
			'data-fv-event': 'plans-portal-click',
			'data-fv-event-action': 'manage',
			'data-fv-event-cycle': 'monthly',
			'data-fv-event-plan': 'growth',
		})
		expect(eventAttributes(screen.getByTestId('manage-subscription-1'))).toMatchObject({
			'data-fv-event-action': 'change',
			'data-fv-event-plan': 'starter',
		})
		// the signed portal URL stays in the href only
		expect(manage.getAttribute('href')).toBe(PORTAL_URL)
		expect(everythingSent()).not.toMatch(/lemonsqueezy|signature/)
	})
})

describe('billing page events', () => {
	it.each([
		['the portal opens', () => getCustomerPortalUrl.mockResolvedValue(PORTAL_URL), { outcome: 'ok', status: 'portal' }],
		[
			'the account never bought anything',
			() => getCustomerPortalUrl.mockResolvedValue(null),
			{ outcome: 'error', status: 'no-customer' },
		],
		[
			'the portal cannot be loaded',
			() => getCustomerPortalUrl.mockRejectedValue(new Error('timeout')),
			{ outcome: 'error', status: 'exception' },
		],
	])('sends one event when %s', async (_case, arrange, expected) => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		arrange()

		render(createElement(BillingPage))

		await waitFor(() => expect(events('billing-portal-redirect')).toEqual([expected]))
		expect(everythingSent()).not.toMatch(/lemonsqueezy|signature|timeout/)
		vi.restoreAllMocks()
	})
})

describe('API key events', () => {
	const storedKey = {
		id: 'key-1',
		name: KEY_NAME,
		jwt: 'heade*****ature',
		createdAt: '2026-01-01',
		expiredAt: '2030-01-01',
	}

	it('sends the outcome of a creation and of a copy, never the key or its name', async () => {
		getAllToken.mockResolvedValue([])
		createToken.mockResolvedValue({ id: 'key-2', jwt: KEY_VALUE, jwt_shortened: 'heade*****w-key' })
		copyToClipboard.mockResolvedValue(true)
		render(createElement(TokenList))
		const add = await screen.findByRole('button', { name: 'Add token' })
		expect(eventAttributes(add)).toEqual({ 'data-fv-event': 'tokens-create-click' })

		fireEvent.click(add)
		fireEvent.change(await screen.findByLabelText('Name'), { target: { value: KEY_NAME } })
		fireEvent.click(screen.getByRole('button', { name: 'Create Token' }))
		fireEvent.click(await screen.findByRole('button', { name: 'Copy' }))

		await waitFor(() => expect(events('tokens-key-copy')).toEqual([undefined]))
		expect(events('tokens-create-result')).toEqual([{ outcome: 'ok' }])
		expect(copyToClipboard).toHaveBeenCalledWith(KEY_VALUE)
		expect(eventAttributes(screen.getByRole('button', { name: 'I copied it' }))).toEqual({
			'data-fv-event': 'tokens-modal-close',
			'data-fv-event-modal': 'create',
			'data-fv-event-via': 'copied',
		})
		expect(everythingSent()).not.toMatch(/Client website|signature|header\.payload|heade/)
	})

	it('sends an error outcome when the key cannot be created', async () => {
		getAllToken.mockResolvedValue([])
		createToken.mockRejectedValue(new Error('database down'))
		render(createElement(TokenList))

		fireEvent.click(await screen.findByRole('button', { name: 'Add token' }))
		fireEvent.change(await screen.findByLabelText('Name'), { target: { value: KEY_NAME } })
		fireEvent.click(screen.getByRole('button', { name: 'Create Token' }))

		await waitFor(() => expect(events('tokens-create-result')).toEqual([{ outcome: 'error' }]))
		expect(everythingSent()).not.toMatch(/Client website|database down/)
	})

	it.each([
		['ok', () => deleteToken.mockResolvedValue({})],
		['error', () => deleteToken.mockRejectedValue(new Error('not yours'))],
	])('sends the %s outcome of a revocation, never which key', async (outcome, arrange) => {
		getAllToken.mockResolvedValue([storedKey])
		arrange()
		render(createElement(TokenList))
		const remove = await screen.findByTestId('delete-token-button-0')
		expect(eventAttributes(remove)).toEqual({ 'data-fv-event': 'tokens-delete-click' })

		fireEvent.click(remove)
		const dialog = await screen.findByRole('dialog')
		expect(eventAttributes(within(dialog).getByRole('button', { name: 'Cancel' }))).toEqual({
			'data-fv-event': 'tokens-modal-close',
			'data-fv-event-modal': 'delete',
			'data-fv-event-via': 'cancel',
		})
		fireEvent.click(within(dialog).getByTestId('revoke-key-button'))

		await waitFor(() => expect(events('tokens-delete-result')).toEqual([{ outcome }]))
		expect(everythingSent()).not.toMatch(/key-1|Client website|heade|not yours/)
	})
})

describe('other dashboard events', () => {
	it('sends the state the mobile menu goes to, read before the toggle', () => {
		render(createElement(MobileNavigationAppComponent))
		const [toggle] = screen.getAllByRole('button', { name: 'Toggle navigation' })

		fireEvent.click(toggle)
		expect(useMobileNavigationStore.getState().isOpen).toBe(true)
		fireEvent.click(screen.getAllByRole('button', { name: 'Toggle navigation' })[0])

		expect(events('dash-menu-toggle')).toEqual([{ action: 'open' }, { action: 'close' }])
	})

	it.each([
		['an account that already processed images', [{ usedAt: '2026-10-01', creditsLeft: 4 }], true],
		['an account that never did', [], false],
	])('tells the usage page of %s', async (_case, usage, hasUsage) => {
		getMyCredits.mockResolvedValue(4)
		getMyUsage.mockResolvedValue(usage)
		getMyUsageByToken.mockResolvedValue([])

		render(createElement(UsageChartComponent))

		await waitFor(() => expect(events('usage-data-view')).toEqual([{ has_usage: hasUsage }]))
		// the balance is shown, not sent
		expect((await screen.findAllByText(/credits left/)).length).toBeGreaterThan(0)
		expect(everythingSent()).not.toMatch(/creditsLeft|2026-10-01|user_2abcDEF/)
	})

	it('tracks the opening and the closing of a plugin question', () => {
		render(createElement(FaqPluginComponent))
		const question = screen.getByRole('button', { name: 'Is the plugin free?' })

		fireEvent.click(question)
		expect(screen.getByText(/free to install\. Generating descriptions uses credits/)).toBeTruthy()
		fireEvent.click(question)

		expect(events('wp-faq-toggle')).toEqual([
			{ action: 'open', question: 'is-the-plugin-free' },
			{ action: 'close', question: 'is-the-plugin-free' },
		])
	})
})
