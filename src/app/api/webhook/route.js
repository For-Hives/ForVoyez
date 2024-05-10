import { createHmac, timingSafeEqual } from 'crypto'

import { processWebhook, saveWebhooks } from '@/services/webhook.service'

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

		// Process the webhook payload
		const webhookId = await saveWebhooks(JSON.parse(rawBody))

		// non blocking process
		processWebhook(webhookId)
	} catch (error) {
		console.error(error)
		return new Response(`Webhook error: ${error.message}`, {
			status: 400,
		})
	}

	return new Response('Success!', {
		status: 200,
	})
}
