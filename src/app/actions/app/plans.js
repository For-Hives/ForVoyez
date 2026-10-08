'use server'

import {
	createCheckoutLink,
	getCustomerPortalLink,
} from '@/services/lemonsqueezy.service'
import {
	getPlans,
	getSubscriptionFromUserId,
} from '@/services/database.service'
import { requireUserId } from '@/services/auth.service'

// Creates the checkout of the plan the user clicked, so that showing the plans
// page creates none. The browser only names the variant: the checkout is
// created for the matching enabled plan of the database, never for any other id.
export async function createCheckoutUrl(variantId) {
	const userId = await requireUserId()
	const plans = await getPlans()
	const plan = plans.find(
		stored => stored.variantEnabled && stored.variantId === variantId
	)

	if (!plan) {
		throw new Error('Unknown plan')
	}

	return createCheckoutLink(plan.variantId, userId)
}

// Returns null when the user never bought anything (no Lemon Squeezy customer).
export async function getCustomerPortalUrl() {
	await requireUserId()
	return getCustomerPortalLink()
}

export async function getMySubscription() {
	await requireUserId()
	return getSubscriptionFromUserId()
}

// Public on purpose: the landing pricing table lists the plans to visitors.
export async function listPlans() {
	return getPlans()
}
