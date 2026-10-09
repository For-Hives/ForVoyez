import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createElement } from 'react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMySubscription, listPlans } from '@/app/actions/app/plans'
import { ChangingPlansComponent } from '@/components/Dashboard/ChangingPlans.component'

vi.mock('next/navigation', () => ({
	useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}))
vi.mock('@/app/actions/app/plans', () => ({
	getCustomerPortalUrl: vi.fn(),
	getMySubscription: vi.fn(),
	createCheckoutUrl: vi.fn(),
	listPlans: vi.fn(),
}))

const COMMON_FEATURES = [
	'Title, alternative text and caption for each image',
	'JPEG, PNG, WebP and non-animated GIF, up to 10 MB',
	'Generate directly from your WordPress media library',
	'Email support',
]

// what the cards used to promise and the code does not do
const FALSE_PROMISES =
	/1080p|4K|Basic|Advanced|Priority|24\/7|SLA|20% more|more tokens|image descriptions\*|Unlimited|beta|hosting/

// the legacy Plan.features column of production, still in the database
const LEGACY_FEATURES = JSON.stringify([
	'250 image descriptions*/month',
	'Basic metadata generation',
	'Community support',
	'Classic image formats (JPEG, PNG, WebP)',
	'Full HD image support (up to 1080p)',
	'Limited access to playground',
	'Advanced metadata generation',
	'Priority support',
	'Ultra HD image support (up to 4K)',
])

function featuresOf(card) {
	return within(card)
		.getAllByRole('listitem')
		.map(item => item.textContent)
}

function plan(fields) {
	return {
		description: '<p>Plan description</p>',
		features: LEGACY_FEATURES,
		buttonText: 'Subscribe',
		variantEnabled: true,
		mostPopular: false,
		...fields,
	}
}

// the plans of production (2026-10-08); a new array on each call, the
// component sorts it in place
function productionPlans() {
	return [
		plan({
			billingCycle: 'month',
			variantId: '422064',
			packageSize: 250,
			name: 'Starter',
			price: 195,
			id: 1,
		}),
		plan({
			billingCycle: 'year',
			variantId: '422065',
			packageSize: 3000,
			name: 'Starter',
			price: 1995,
			id: 2,
		}),
		plan({
			billingCycle: 'month',
			variantId: '422067',
			packageSize: 2500,
			mostPopular: true,
			name: 'Growth',
			price: 1399,
			id: 3,
		}),
		plan({
			billingCycle: 'year',
			variantId: '422068',
			packageSize: 30000,
			mostPopular: true,
			name: 'Growth',
			price: 13995,
			id: 4,
		}),
		plan({
			name: '100 Credits',
			variantId: '379035',
			billingCycle: null,
			packageSize: 100,
			features: '[]',
			price: 390,
			id: 7,
		}),
	]
}

async function renderPlans() {
	render(createElement(ChangingPlansComponent))
	return screen.findByTestId('plans-section')
}

// the badge keeps its words together with non-breaking spaces
function text(element) {
	return element.textContent.replace(/ /g, ' ')
}

describe('Plans page promises', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		listPlans.mockImplementation(async () => productionPlans())
		getMySubscription.mockResolvedValue(null)
	})

	afterEach(() => {
		cleanup()
	})

	it('shows the monthly plans with their credits, not the database features', async () => {
		const section = await renderPlans()

		expect(featuresOf(screen.getByTestId('plan-1'))).toEqual(['250 credits*/month', ...COMMON_FEATURES])
		expect(featuresOf(screen.getByTestId('plan-3'))).toEqual(['All Starter plan features', '2,500 credits*/month'])
		expect(screen.getByTestId('feature-250 credits*/month')).toBeTruthy()
		expect(screen.getByTestId('feature-Email support')).toBeTruthy()
		expect(screen.queryByTestId('plan-2')).toBeNull()
		expect(screen.queryByTestId('plan-7')).toBeNull()
		expect(section.textContent).not.toMatch(FALSE_PROMISES)
	})

	it('shows the real annual saving on the toggle and the monthly cards', async () => {
		await renderPlans()

		expect(text(screen.getByTestId('annual-saving-badge'))).toBe('Up to 16.6% cheaper')
		expect(screen.getAllByTestId('get-more-tokens-button').map(text)).toEqual([
			'Pay annually: 14.7% cheaper',
			'Pay annually: 16.6% cheaper',
		])
	})

	it('switches to the yearly plans from a monthly card', async () => {
		const section = await renderPlans()

		fireEvent.click(screen.getAllByTestId('get-more-tokens-button')[0])

		const starter = await screen.findByTestId('plan-2')
		const growth = screen.getByTestId('plan-4')
		expect(featuresOf(starter)).toEqual(['3,000 credits*/year', ...COMMON_FEATURES])
		expect(featuresOf(growth)).toEqual(['All Starter plan features', '30,000 credits*/year'])
		expect(within(starter).getByText(/cheaper/).parentElement.textContent).toBe('14.7% cheaper than monthly')
		expect(within(growth).getByText(/cheaper/).parentElement.textContent).toBe('16.6% cheaper than monthly')
		expect(screen.queryByTestId('get-more-tokens-button')).toBeNull()
		expect(screen.getByTestId('subscribe-422065')).toBeTruthy()
		expect(screen.getByTestId('subscribe-422068')).toBeTruthy()
		expect(section.textContent).not.toMatch(FALSE_PROMISES)
	})

	it('shows the same saving with the frequency toggle', async () => {
		await renderPlans()

		fireEvent.click(screen.getByTestId('frequency-option-annually'))

		expect(await screen.findByTestId('plan-4')).toBeTruthy()
		expect(screen.getByText('16.6% cheaper')).toBeTruthy()
		expect(text(screen.getByTestId('annual-saving-badge'))).toBe('Up to 16.6% cheaper')
	})

	it('offers on Enterprise only what the Growth plan has, plus custom credits', async () => {
		const section = await renderPlans()

		const enterprise = screen.getByTestId('plan-custom')
		expect(featuresOf(enterprise)).toEqual(['All Growth plan features', 'Custom credit volume', 'Volume discounts'])
		expect(screen.getByTestId('contact-us-link').getAttribute('href')).toBe('/contact')
		expect(section.textContent).toContain('(*), 1 credit correspond to 1 image description with ForVoyez API.')
	})

	it('shows no saving when the yearly plans do not give 12 times the monthly credits', async () => {
		listPlans.mockImplementation(async () =>
			productionPlans().map(tier =>
				tier.billingCycle === 'year' ? { ...tier, packageSize: tier.packageSize + tier.packageSize / 5 } : tier
			)
		)
		const section = await renderPlans()

		expect(screen.queryByTestId('annual-saving-badge')).toBeNull()
		expect(screen.queryByTestId('get-more-tokens-button')).toBeNull()

		fireEvent.click(screen.getByTestId('frequency-option-annually'))

		const starter = await screen.findByTestId('plan-2')
		expect(featuresOf(starter)[0]).toBe('3,600 credits*/year')
		expect(section.textContent).not.toMatch(/cheaper|more tokens/)
	})
})
