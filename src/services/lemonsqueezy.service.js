'use server'
import * as ls from '@lemonsqueezy/lemonsqueezy.js'
// import {lemonSqueezySetup} from "@lemonsqueezy/lemonsqueezy.js";

ls.lemonSqueezySetup({
	apiKey: process.env.LEMON_SQUEEZY_API_KEY,
	onError(error) {
		console.log(error)
	},
})

export async function listProducts() {
	const { statusCode, error, data } = await ls.listProducts()

	if (statusCode === 200) {
		return data.data
	} else {
		throw new Error(error)
	}
}
