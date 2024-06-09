'use server'
import * as ls from '@lemonsqueezy/lemonsqueezy.js'
import { currentUser } from '@clerk/nextjs/server'

import { getCustomerIdFromUser } from '@/services/database.service'

const getStoreId = () => process.env.LEMON_SQUEEZY_STORE_ID

export async function initLemonSqueezy() {
	ls.lemonSqueezySetup({
		onError(error) {
			console.error(error)
		},
		apiKey: process.env.LEMON_SQUEEZY_API_KEY,
	})
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

export async function getCheckouts(plans) {
	await initLemonSqueezy()

	const STORE_ID = getStoreId()
	const user = await currentUser()

	if (!user) {
		console.error('User is not authenticated.')
		throw new Error('User is not authenticated.')
	}

	const check = await ls.listCheckouts({
		product_options: {
			redirectUrl: `${process.env.NEXT_PUBLIC_URL}/app/playground`,
		},
		checkoutData: {
			custom: {
				user_id: user.id,
			},
		},
		filter: {
			storeId: STORE_ID,
		},
		page: {
			size: 100,
		},
	})

	const checkoutUrls = {}

	for (const plan of plans) {
		const existingCheckout = check.data.data.find(
			checkout =>
				checkout.attributes.variant_id.toString() === plan.variantId.toString()
		)

		if (existingCheckout) {
			checkoutUrls[plan.variantId] = existingCheckout.attributes.url
		} else {
			const newCheckout = await ls.createCheckout(STORE_ID, plan.variantId, {
				productOptions: {
					redirectUrl: `https://forvoyez.com/app/billing/`,
					receiptButtonText: 'Go to Dashboard',
					enabledVariants: [plan.variantId], //
				},
				checkoutData: {
					custom: {
						user_id: user.id,
					},
				},
			})
			checkoutUrls[plan.variantId] = newCheckout.data.data.attributes.url
		}
	}

	return checkoutUrls
}

// server-side code
export async function getCustomerPortalLink() {
	await initLemonSqueezy()

	const user = await currentUser()

	if (!user) {
		throw new Error('User is not authenticated.')
	}

	// get user subscription using database.service
	const customerId = await getCustomerIdFromUser(user.id)

	if (!customerId) {
		throw new Error('Customer not found.')
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
