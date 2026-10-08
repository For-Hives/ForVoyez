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
	getCustomerPortalUrl,
	getMySubscription,
	listPlans,
} from '@/app/actions/app/plans'
import {
	getMyCredits,
	getMyUsage,
	getMyUsageByToken,
} from '@/app/actions/app/usage'
import { getCustomerPortalLink } from '@/services/lemonsqueezy.service'

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

		it('getMyCredits should return the balance', async () => {
			getCreditsFromUserId.mockResolvedValue(12)

			await expect(getMyCredits()).resolves.toBe(12)
		})
	})
})
