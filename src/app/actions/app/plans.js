'use server'

import {
	getCheckoutsLinks,
	getCustomerPortalLink,
} from '@/services/lemonsqueezy.service'
import {
	getPlans,
	getSubscriptionFromUserId,
} from '@/services/database.service'
import { requireUserId } from '@/services/auth.service'

// Checkout links are only created for the plans stored in the database, never
// for variant ids sent by the browser.
export async function getCheckoutUrls() {
	await requireUserId()
	const plans = await getPlans()
	return getCheckoutsLinks(plans)
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
