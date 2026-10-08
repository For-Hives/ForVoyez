import { beforeEach, describe, expect, it, vi } from 'vitest'
import { auth } from '@clerk/nextjs/server'

import {
	getCreditsFromUserId,
	getPlans,
	getSubscriptionFromUserId,
	getUsageByToken,
	getUsageForUser,
} from '@/services/database.service'
import {
	getCheckoutUrls,
	getCustomerPortalUrl,
	getMySubscription,
	listPlans,
} from '@/app/actions/app/plans'
import {
	getCheckoutsLinks,
	getCustomerPortalLink,
} from '@/services/lemonsqueezy.service'
import {
	getMyCredits,
	getMyUsage,
	getMyUsageByToken,
} from '@/app/actions/app/usage'

vi.mock('@clerk/nextjs/server')
vi.mock('@/services/database.service')
vi.mock('@/services/lemonsqueezy.service')

const PLANS = [{ variantId: 'v1' }, { variantId: 'v2' }]

describe('client-facing server actions', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		getPlans.mockResolvedValue(PLANS)
	})

	describe('when anonymous', () => {
		beforeEach(() => {
			auth.mockResolvedValue({ userId: null })
		})

		it.each([
			['getMySubscription', getMySubscription, getSubscriptionFromUserId],
			['getCheckoutUrls', getCheckoutUrls, getCheckoutsLinks],
			['getCustomerPortalUrl', getCustomerPortalUrl, getCustomerPortalLink],
			['getMyCredits', getMyCredits, getCreditsFromUserId],
			['getMyUsage', getMyUsage, getUsageForUser],
			['getMyUsageByToken', getMyUsageByToken, getUsageByToken],
		])(
			'%s should reject before touching the data',
			async (_, action, service) => {
				await expect(action()).rejects.toThrow('Unauthorized')
				expect(service).not.toHaveBeenCalled()
			}
		)

		it('listPlans should stay public (landing pricing table)', async () => {
			await expect(listPlans()).resolves.toBe(PLANS)
		})
	})

	describe('when signed in', () => {
		beforeEach(() => {
			auth.mockResolvedValue({ userId: 'user123' })
		})

		it('getCustomerPortalUrl should resolve null for a user who never bought', async () => {
			getCustomerPortalLink.mockResolvedValue(null)

			await expect(getCustomerPortalUrl()).resolves.toBeNull()
		})

		it('getCheckoutUrls should only create checkouts for the stored plans', async () => {
			getCheckoutsLinks.mockResolvedValue({ v1: 'url1', v2: 'url2' })

			await expect(
				getCheckoutUrls([{ variantId: 'injected' }])
			).resolves.toEqual({ v1: 'url1', v2: 'url2' })
			expect(getCheckoutsLinks).toHaveBeenCalledWith(PLANS)
		})

		it('getMyCredits should return the balance', async () => {
			getCreditsFromUserId.mockResolvedValue(12)

			await expect(getMyCredits()).resolves.toBe(12)
		})
	})
})
