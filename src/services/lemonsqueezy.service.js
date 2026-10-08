// Server-only Lemon Squeezy client (uses the store API key). Client components
// reach it through the auth-checked actions in `src/app/actions/app/plans.js`.
import * as ls from '@lemonsqueezy/lemonsqueezy.js'
import { currentUser } from '@clerk/nextjs/server'

import { getCustomerIdFromUser } from '@/services/database.service'

import 'server-only'

const getStoreId = () => process.env.LEMON_SQUEEZY_STORE_ID

// Creates the checkout of one plan, when the user clicks its button. The caller
// checks that the variant is a plan of the database; `userId` is the Clerk id
// the webhook reads back from the custom data to credit the right user.
export async function createCheckoutLink(variantId, userId) {
	if (!userId) {
		console.error('User is not authenticated.')
		throw new Error('User is not authenticated.')
	}

	await initLemonSqueezy()

	const newCheckout = await ls.createCheckout(getStoreId(), variantId, {
		productOptions: {
			redirectUrl: `https://forvoyez.com/app/billing/`,
			receiptButtonText: 'Go to Dashboard',
			enabledVariants: [variantId],
		},
		checkoutData: {
			custom: {
				user_id: userId,
			},
		},
		// 2 hours (7 200 000 ms = 2 hours)
		// the checkout will expire after 2 hours, to prevent the user from using an old checkout link
		// and avoid too many checkouts url in the system
		expiresAt: new Date(Date.now() + 7200000),
	})

	return newCheckout.data.data.attributes.url
}

// Returns the Lemon Squeezy customer portal URL of the authenticated user, or
// null when the user never bought anything (no Lemon Squeezy customer yet).
export async function getCustomerPortalLink() {
	await initLemonSqueezy()

	const user = await currentUser()

	if (!user) {
		throw new Error('User is not authenticated.')
	}

	// get user subscription using database.service
	const customerId = await getCustomerIdFromUser(user.id)

	if (!customerId) {
		return null
	}

	// get customer object
	const customer = await ls.getCustomer(customerId)

	return customer.data.data.attributes.urls.customer_portal
}

export async function getVariant(variantId) {
	const { statusCode, error, data } = await ls.getVariant(variantId)

	if (statusCode === 200) {
		return data
	} else {
		throw new Error(error)
	}
}

export async function initLemonSqueezy() {
	try {
		ls.lemonSqueezySetup({
			onError(error) {
				console.error(error)
				throw error
			},
			apiKey: process.env.LEMON_SQUEEZY_API_KEY,
		})
	} catch (error) {
		console.error(error)
		throw error
	}
}

export async function listPrice(variantID) {
	const { statusCode, error, data } = await ls.listPrices({
		filter: { variantId: variantID },
	})

	if (statusCode === 200) {
		return data.data
	} else {
		throw new Error(error)
	}
}

export async function listProducts() {
	await initLemonSqueezy()
	const STORE_ID = getStoreId()

	const { statusCode, error, data } = await ls.listProducts({
		filter: { storeId: STORE_ID },
		include: ['variants'],
	})

	if (statusCode === 200) {
		return data.data
	} else {
		throw new Error(error)
	}
}
