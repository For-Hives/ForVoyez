import { NextApiResponse, NextApiRequest } from 'next'
import { nodejsWebHookHandler } from 'lemonsqueezy-webhooks'

export const config = {
	api: {
		// important! otherwise the body signature check will fail
		bodyParser: false,
	},
}

const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET

if (!secret) {
	throw new Error('SECRET is not set')
}

export default async function handler(req, res) {
	await nodejsWebHookHandler({
		async onData(payload) {
			console.log(payload)
			if (payload.event_name === 'order_created') {
				// payload.data is an Order
				console.log(payload.data.attributes.status)
			}
		},
		req,
		res,
		secret,
	})
}
