import { beforeEach, describe, expect, it, vi } from 'vitest'
import { auth } from '@clerk/nextjs/server'

import { createCheckoutLink } from '@/services/lemonsqueezy.service'
import * as plansActions from '@/app/actions/app/plans'
import { getPlans } from '@/services/database.service'

vi.mock('@clerk/nextjs/server')
vi.mock('@/services/database.service')
vi.mock('@/services/lemonsqueezy.service')

const { createCheckoutUrl } = plansActions

const CHECKOUT_URL = 'https://forvoyez.lemonsqueezy.com/checkout/custom/abc'
const PLANS = [
	{ billingCycle: 'month', variantEnabled: true, variantId: '365926' },
	{ variantEnabled: true, variantId: '379035', billingCycle: '' },
	{ variantEnabled: false, billingCycle: 'month', variantId: '400000' },
]

describe('createCheckoutUrl (plans page buttons)', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		getPlans.mockResolvedValue(PLANS)
		createCheckoutLink.mockResolvedValue(CHECKOUT_URL)
	})

	it('rejects an anonymous request before creating anything', async () => {
		auth.mockResolvedValue({ userId: null })

		await expect(createCheckoutUrl('365926')).rejects.toThrow('Unauthorized')
		expect(getPlans).not.toHaveBeenCalled()
		expect(createCheckoutLink).not.toHaveBeenCalled()
	})

	describe('when signed in', () => {
		beforeEach(() => {
			auth.mockResolvedValue({ userId: 'user_123' })
		})

		it.each([
			['a variant that is not in the Plan table', '999999'],
			['a disabled plan', '400000'],
			['a number instead of the stored id', 365926],
			['no variant', undefined],
		])('refuses %s without creating a checkout', async (_, variantId) => {
			await expect(createCheckoutUrl(variantId)).rejects.toThrow('Unknown plan')
			expect(createCheckoutLink).not.toHaveBeenCalled()
		})

		it('creates the checkout of the clicked plan only, for the signed-in user', async () => {
			await expect(createCheckoutUrl('379035')).resolves.toBe(CHECKOUT_URL)

			expect(createCheckoutLink).toHaveBeenCalledTimes(1)
			expect(createCheckoutLink).toHaveBeenCalledWith('379035', 'user_123')
		})
	})

	// it created a checkout for every plan on each display of the plans page
	it('no longer exposes the action that created the checkouts of all plans', () => {
		expect(plansActions).not.toHaveProperty('getCheckoutUrls')
	})
})
