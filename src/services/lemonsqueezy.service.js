'use server'
import { createCheckout, listCheckouts } from '@lemonsqueezy/lemonsqueezy.js'
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

export async function getCheckouts() {
	await initLemonSqueezy()

	const STORE_ID = getStoreId()
	const user = await currentUser()

	if (!user) {
		console.error('User is not authenticated.')
		throw new Error('User is not authenticated.')
	}

	const res = await listCheckouts({
		checkoutData: {
			custom: {
				user_id: user.id,
			},
		},
	})
	console.log(res)
	console.log(res.data.data[0])
}

// This action will create a checkout on Lemon Squeezy.
export async function getCheckoutURL(variantId, embed = false) {
	await initLemonSqueezy()

	const STORE_ID = getStoreId()
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
		console.warn('Customer not found.')
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
