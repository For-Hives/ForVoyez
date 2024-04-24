import { NextApiResponse, NextApiRequest } from 'next'
import { nodejsWebHookHandler } from 'lemonsqueezy-webhooks'
import { headers } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET

export async function POST(request) {
	try {
		if (!secret) {
			return new Response('Lemon Squeezy Webhook Secret not set in .env', {
				status: 500,
			})
		}

		// check if the request come from lemonsqueezy servers #Security
		const rawBody = await request.text()

		const hmac = createHmac('sha256', secret)
		const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
		const signature = Buffer.from(
			request.headers.get('X-Signature') ?? '',
			'utf8'
		)

		if (!timingSafeEqual(digest, signature)) {
			return new Response(`Webhook not authorized`, {
				status: 401,
			})
		}

		// extract payload from request
		const payload = JSON.parse(rawBody)
		// Process the webhook payload

		console.log(payload)

		// switch
		switch (payload.meta.event_name) {
			case 'order_created':
				console.log('order_created')
				break
			case 'subscription_created':
				console.log('Subscription created')
				break
			case 'subscription_payment_success':
				console.log('subscription_payment_success')
				break
			case 'subscription_updated':
				console.log('subscription_updated')
				break
		}
	} catch (error) {
		console.log(error)
		return new Response(`Webhook error: ${error.message}`, {
			status: 400,
		})
	}

	return new Response('Success!', {
		status: 200,
	})
}
