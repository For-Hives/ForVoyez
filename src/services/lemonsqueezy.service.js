'use server'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import * as ls from '@lemonsqueezy/lemonsqueezy.js'
import { currentUser } from '@clerk/nextjs/server'

import { getCustomerIdFromUser } from '@/services/database.service'
// import {lemonSqueezySetup} from "@lemonsqueezy/lemonsqueezy.js";

const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID

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

	const user = await currentUser()

	if (!user) {
		console.error('User is not authenticated.')
		throw new Error('User is not authenticated.')
	}

	const checkout = await createCheckout(STORE_ID, variantId, {
		productOptions: {
			receiptButtonText: 'Go to Dashboard',
			enabledVariants: [variantId], // redirectUrl: `${process.env.NEXT_PUBLIC_URL}/app/billing/`,
		},
		checkoutOptions: {
			media: false,
			logo: !embed,
			embed,
		},
		checkoutData: {
			custom: {
				user_id: user.id,
			},
		},
	})

	return checkout.data?.data.attributes.url
}

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
