import { describe, expect, it } from 'vitest'

import {
	formatSaving,
	getAnnualSaving,
	getEnterpriseFeatures,
	getMaxAnnualSaving,
	getPlanFeatures,
} from '@/helpers/planFeatures'

// the legacy Plan.features column of production (hand-written, never synced)
const LEGACY_STARTER_FEATURES = [
	'250 image descriptions*/month',
	'Basic metadata generation',
	'Community support',
	'Classic image formats (JPEG, PNG, WebP)',
	'Full HD image support (up to 1080p)',
	'Limited access to playground',
]
const LEGACY_GROWTH_FEATURES = [
	'All Starter plan features',
	'2,500 image descriptions*/month',
	'Advanced metadata generation',
	'Priority support',
	'Full access to playground',
	'Ultra HD image support (up to 4K)',
]

const COMMON_FEATURES = [
	'Title, alternative text and caption for each image',
	'JPEG, PNG, WebP and non-animated GIF, up to 10 MB',
	'Generate directly from your WordPress media library',
	'Email support',
]

// the plans of production (2026-10-08), as listPlans returns them
function productionPlans() {
	return [
		{
			features: JSON.stringify(LEGACY_STARTER_FEATURES),
			billingCycle: 'month',
			variantId: '422064',
			packageSize: 250,
			name: 'Starter',
			price: 195,
			id: 1,
		},
		{
			features: JSON.stringify(['3,000 image descriptions*/month', ...LEGACY_STARTER_FEATURES.slice(1)]),
			billingCycle: 'year',
			variantId: '422065',
			packageSize: 3000,
			name: 'Starter',
			price: 1995,
			id: 2,
		},
		{
			features: JSON.stringify(LEGACY_GROWTH_FEATURES),
			billingCycle: 'month',
			variantId: '422067',
			packageSize: 2500,
			name: 'Growth',
			price: 1399,
			id: 3,
		},
		{
			features: JSON.stringify(LEGACY_GROWTH_FEATURES.map(feature => feature.replace('2,500', '30,000'))),
			billingCycle: 'year',
			variantId: '422068',
			packageSize: 30000,
			name: 'Growth',
			price: 13995,
			id: 4,
		},
		{
			name: '100 Credits',
			variantId: '379035',
			billingCycle: null,
			packageSize: 100,
			features: '[]',
			price: 390,
			id: 7,
		},
	]
}

function tier(plans, name, billingCycle) {
	return plans.find(plan => plan.name === name && plan.billingCycle === billingCycle)
}

describe('getPlanFeatures', () => {
	const plans = productionPlans()

	it('lists the credits and what every plan gets on Starter monthly', () => {
		expect(getPlanFeatures(tier(plans, 'Starter', 'month'), plans)).toEqual(['250 credits*/month', ...COMMON_FEATURES])
	})

	it('gives the yearly credits per year on Starter annually', () => {
		expect(getPlanFeatures(tier(plans, 'Starter', 'year'), plans)).toEqual(['3,000 credits*/year', ...COMMON_FEATURES])
	})

	it('includes Starter on Growth monthly', () => {
		expect(getPlanFeatures(tier(plans, 'Growth', 'month'), plans)).toEqual([
			'All Starter plan features',
			'2,500 credits*/month',
		])
	})

	it('includes Starter on Growth annually', () => {
		expect(getPlanFeatures(tier(plans, 'Growth', 'year'), plans)).toEqual([
			'All Starter plan features',
			'30,000 credits*/year',
		])
	})

	it('derives the names and credits from the plans, not from constants', () => {
		const renamed = [
			{
				billingCycle: 'month',
				packageSize: 1200,
				variantId: '1',
				name: 'Pro',
				price: 900,
			},
			{
				billingCycle: 'month',
				packageSize: 500,
				variantId: '2',
				name: 'Basic',
				price: 300,
			},
		]

		expect(getPlanFeatures(renamed[0], renamed)).toEqual(['All Basic plan features', '1,200 credits*/month'])
		expect(getPlanFeatures(renamed[1], renamed)).toEqual(['500 credits*/month', ...COMMON_FEATURES])
	})

	it('never returns the legacy features column', () => {
		const features = plans.flatMap(plan => getPlanFeatures(plan, plans))

		expect(features.join('\n')).not.toMatch(/image descriptions|1080p|4K|Basic|Advanced|Priority|Community/)
	})

	it('promises no credits when the plan has none synced', () => {
		const withoutCredits = { billingCycle: 'month', name: 'Starter', price: 1 }

		expect(getPlanFeatures(withoutCredits, [withoutCredits])).toEqual(COMMON_FEATURES)
	})

	it('lists the common features on a plan when no plan is loaded', () => {
		expect(getPlanFeatures(tier(plans, 'Growth', 'month'), [])).toEqual(['2,500 credits*/month', ...COMMON_FEATURES])
	})

	it('has no features for a refill', () => {
		expect(getPlanFeatures(plans[4], plans)).toEqual([])
	})
})

describe('getAnnualSaving', () => {
	const plans = productionPlans()

	it('is 14.7% for Starter (19.95€/year against 12 x 1.95€)', () => {
		expect(getAnnualSaving(tier(plans, 'Starter', 'year'), plans)).toBe(14.7)
	})

	it('is 16.6% for Growth (139.95€/year against 12 x 13.99€)', () => {
		expect(getAnnualSaving(tier(plans, 'Growth', 'year'), plans)).toBe(16.6)
	})

	it('gives a monthly plan the saving of its yearly plan', () => {
		expect(getAnnualSaving(tier(plans, 'Starter', 'month'), plans)).toBe(14.7)
		expect(getAnnualSaving(tier(plans, 'Growth', 'month'), plans)).toBe(16.6)
	})

	it('rounds half away from zero to one decimal', () => {
		const monthly = {
			billingCycle: 'month',
			packageSize: 100,
			name: 'Plan',
			price: 1000,
		}
		// 1 - 10230 / 12000 = 14.75%
		const yearly = {
			billingCycle: 'year',
			packageSize: 1200,
			name: 'Plan',
			price: 10230,
		}

		expect(getAnnualSaving(yearly, [monthly, yearly])).toBe(14.8)
	})

	it('is null when the yearly plan does not give 12 times the monthly credits', () => {
		const morePlans = productionPlans()
		tier(morePlans, 'Starter', 'year').packageSize = 3600

		expect(getAnnualSaving(tier(morePlans, 'Starter', 'year'), morePlans)).toBeNull()
		expect(getAnnualSaving(tier(morePlans, 'Starter', 'month'), morePlans)).toBeNull()
		expect(getAnnualSaving(tier(morePlans, 'Growth', 'year'), morePlans)).toBe(16.6)
	})

	it('is null when the yearly plan is not cheaper', () => {
		const pricier = productionPlans()
		tier(pricier, 'Starter', 'year').price = 12 * 195

		expect(getAnnualSaving(tier(pricier, 'Starter', 'year'), pricier)).toBeNull()
	})

	it('is null without the plan of the other billing cycle', () => {
		const monthlyOnly = productionPlans().filter(plan => plan.billingCycle !== 'year')

		expect(getAnnualSaving(tier(monthlyOnly, 'Starter', 'month'), monthlyOnly)).toBeNull()
		expect(getAnnualSaving(tier(plans, 'Starter', 'year'), [])).toBeNull()
	})

	it('is null for a refill', () => {
		expect(getAnnualSaving(plans[4], plans)).toBeNull()
	})
})

describe('getMaxAnnualSaving', () => {
	it('is the best yearly saving', () => {
		expect(getMaxAnnualSaving(productionPlans())).toBe(16.6)
	})

	it('ignores the yearly plans without a saving', () => {
		const plans = productionPlans()
		tier(plans, 'Growth', 'year').packageSize = 36000

		expect(getMaxAnnualSaving(plans)).toBe(14.7)
	})

	it('is null when no yearly plan is cheaper or no plan is loaded', () => {
		const plans = productionPlans()
		tier(plans, 'Starter', 'year').packageSize = 3600
		tier(plans, 'Growth', 'year').packageSize = 36000

		expect(getMaxAnnualSaving(plans)).toBeNull()
		expect(getMaxAnnualSaving([])).toBeNull()
		expect(getMaxAnnualSaving(undefined)).toBeNull()
	})
})

describe('getEnterpriseFeatures', () => {
	it('includes the most expensive monthly plan', () => {
		expect(getEnterpriseFeatures(productionPlans())).toEqual([
			'All Growth plan features',
			'Custom credit volume',
			'Volume discounts',
		])
	})

	it('names no plan when no plan is loaded', () => {
		const refillsOnly = productionPlans().filter(plan => !plan.billingCycle)

		expect(getEnterpriseFeatures([])).toEqual(['Custom credit volume', 'Volume discounts'])
		expect(getEnterpriseFeatures(refillsOnly)).toEqual(['Custom credit volume', 'Volume discounts'])
	})
})

describe('formatSaving', () => {
	it('shows one decimal at most', () => {
		expect(formatSaving(14.7)).toBe('14.7%')
		expect(formatSaving(16.6)).toBe('16.6%')
		expect(formatSaving(15)).toBe('15%')
	})
})
