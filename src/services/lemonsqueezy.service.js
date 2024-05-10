'use server'
import { auth } from '@clerk/nextjs'
import * as ls from '@lemonsqueezy/lemonsqueezy.js'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'

import { getCustomerIdFromUser } from '@/services/database.service'
// import {lemonSqueezySetup} from "@lemonsqueezy/lemonsqueezy.js";

const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID

export async function initLemonSqueezy() {
	ls.lemonSqueezySetup({
		apiKey: process.env.LEMON_SQUEEZY_API_KEY,
		onError(error) {
			console.error(error)
		},
	})
}

export async function listProducts() {
	await initLemonSqueezy()

	const { statusCode, error, data } = await ls.listProducts({
		filter: { storeId: STORE_ID },
		include: ['variants'],
	})

	// todo : sync with database

	if (statusCode === 200) {
		// todo : save variant in database
		return data.data
	} else {
		throw new Error(error)
	}
}

// get all products variants named "variation"
export async function listVariants(productID) {
	await initLemonSqueezy()

	const { statusCode, error, data } = await ls.listVariants({
		filter: { productId: productID },
	})

	// todo : sync with database

	if (statusCode === 200) {
		return data.data
	} else {
		console.error(error)
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

/**
 * This action will create a checkout on Lemon Squeezy.
 */
export async function getCheckoutURL(variantId, embed = false) {
	await initLemonSqueezy()

	const user = await auth()

	if (!user) {
		throw new Error('User is not authenticated.')
	}

	const checkout = await createCheckout(STORE_ID, variantId, {
		checkoutOptions: {
			embed,
			media: false,
			logo: !embed,
		},
		checkoutData: {
			custom: {
				user_id: user.userId,
			},
		},
		productOptions: {
			enabledVariants: [variantId], // redirectUrl: `${process.env.NEXT_PUBLIC_URL}/app/billing/`,
			receiptButtonText: 'Go to Dashboard',
		},
	})

	return checkout.data?.data.attributes.url
}

export async function getCustomerPortalLink() {
	await initLemonSqueezy()

	const user = await auth()

	if (!user) {
		throw new Error('User is not authenticated.')
	}

	// get user subscription using database.service
	const customerId = await getCustomerIdFromUser(user.userId)

	if (!customerId) {
		throw new Error('Customer not found.')
	}

	// get customer object
	const customer = await ls.getCustomer(customerId)

	return customer.data.data.attributes.urls.customer_portal
}
