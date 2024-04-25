'use server'
import * as ls from '@lemonsqueezy/lemonsqueezy.js'
import { createCheckout, NewCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { auth } from '@clerk/nextjs'
// import {lemonSqueezySetup} from "@lemonsqueezy/lemonsqueezy.js";

const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID

export async function initLemonSqueezy() {
	ls.lemonSqueezySetup({
		apiKey: process.env.LEMON_SQUEEZY_API_KEY,
		onError(error) {
			console.log(error)
		},
	})
}

export async function listProducts() {
	await initLemonSqueezy()

	const { statusCode, error, data } = await ls.listProducts({
		filter: { storeId: STORE_ID },
		include: ['variants'],
	})

	if (statusCode === 200) {
		console.log(data.data[0].relationships.variants.data)
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

	// console.log(user)

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
			enabledVariants: [variantId],
			// redirectUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing/`,
			receiptButtonText: 'Go to Dashboard',
		},
	})
	console.log(checkout)

	return checkout.data?.data.attributes.url
}
