import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from '@testing-library/react'
import { createElement } from 'react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PricingComponent } from '@/components/Landing/Pricing/Pricing.component'
import { listPlans } from '@/app/actions/app/plans'

vi.mock('@/app/actions/app/plans', () => ({
	listPlans: vi.fn(),
}))

const COMMON_FEATURES = [
	'Title, alternative text and caption for each image',
	'JPEG, PNG, WebP and non-animated GIF, up to 10 MB',
	'API, WordPress plugin and playground',
	'Email support',
]

// what the public pricing used to promise and the code does not do
const FALSE_PROMISES =
	/1080p|4K|Basic|Advanced|Priority|24\/7|SLA|20% more|more tokens|image descriptions\*|Unlimited|beta|hosting/

// the legacy Plan.features column of production, still in the database
const LEGACY_FEATURES = JSON.stringify([
	'250 image descriptions*/month',
	'Basic metadata generation',
	'Full HD image support (up to 1080p)',
	'Priority support',
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

// the plans of production (2026-10-08)
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
			name: 'Growth',
			price: 1399,
			id: 3,
		}),
		plan({
			billingCycle: 'year',
			variantId: '422068',
			packageSize: 30000,
			name: 'Growth',
			price: 13995,
			id: 4,
		}),
		plan({
			variantId: '422070',
			name: '250 Credits',
			billingCycle: null,
			packageSize: 250,
			features: '[]',
			price: 150,
			id: 7,
		}),
	]
}

// the badge keeps its words together with non-breaking spaces
function text(element) {
	return element.textContent.replace(/ /g, ' ')
}

describe('Landing page pricing promises', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		listPlans.mockImplementation(async () => productionPlans())
	})

	afterEach(() => {
		cleanup()
	})

	it('shows the monthly plans with their credits and the real annual saving', async () => {
		render(createElement(PricingComponent))
		const [starter, growth] = await screen.findAllByTestId('plan-month')

		expect(featuresOf(starter)).toEqual([
			'250 credits*/month',
			...COMMON_FEATURES,
		])
		expect(featuresOf(growth)).toEqual([
			'All Starter plan features',
			'2,500 credits*/month',
		])
		expect(text(screen.getByTestId('annual-saving-badge'))).toBe(
			'Up to 16.6% cheaper'
		)
		expect(screen.getAllByTestId('get-more-tokens').map(text)).toEqual([
			'Pay annually: 14.7% cheaper',
			'Pay annually: 16.6% cheaper',
		])
		expect(document.body.textContent).not.toMatch(FALSE_PROMISES)
	})

	it('switches to the yearly plans with credits per year', async () => {
		render(createElement(PricingComponent))
		fireEvent.click((await screen.findAllByTestId('get-more-tokens'))[0])

		const [starter, growth] = await screen.findAllByTestId('plan-year')
		expect(featuresOf(starter)).toEqual([
			'3,000 credits*/year',
			...COMMON_FEATURES,
		])
		expect(featuresOf(growth)).toEqual([
			'All Starter plan features',
			'30,000 credits*/year',
		])
		expect(within(starter).getByText(/cheaper/).parentElement.textContent).toBe(
			'14.7% cheaper than monthly'
		)
		expect(document.body.textContent).not.toMatch(FALSE_PROMISES)
	})

	it('offers on Enterprise only what the Growth plan has, plus custom credits', async () => {
		render(createElement(PricingComponent))
		await screen.findAllByTestId('plan-month')

		expect(featuresOf(screen.getByTestId('plan-custom'))).toEqual([
			'All Growth plan features',
			'Custom credit volume',
			'Volume discounts',
		])
	})
})
