import { createHmac, timingSafeEqual } from 'crypto'

import { processWebhook, saveWebhooks } from '@/services/webhook.service'

const WEBHOOK_SECRET = () => process.env.LEMON_SQUEEZY_WEBHOOK_SECRET

export async function POST(request) {
	try {
		console.info('webhook request received')
		const secret = WEBHOOK_SECRET()
		if (!secret) {
			console.error('Lemon Squeezy Webhook Secret not set in .env')
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

		// timingSafeEqual throws when the lengths differ
		if (
			digest.length !== signature.length ||
			!timingSafeEqual(digest, signature)
		) {
			console.error('webhook not authorized')
			return new Response(`Webhook not authorized`, {
				status: 401,
			})
		}

		// Process the webhook payload
		const webhookId = await saveWebhooks(JSON.parse(rawBody))

		// The event is stored: answer 200 even if processing fails, otherwise
		// Lemon Squeezy retries and the event would be stored (and credited)
		// twice. Processing errors are recorded on the stored event.
		try {
			await processWebhook(webhookId)
		} catch (error) {
			console.error(`webhook ${webhookId} processing error:`, error.message)
		}
	} catch (error) {
		// never log the body: it contains the customer's name and email (and
		// Prisma/JSON errors can quote it), so only log the error kind
		console.error('Webhook error:', error.code ?? error.name)
		return new Response('Webhook error', {
			status: 400,
		})
	}

	return new Response('Success!', {
		status: 200,
	})
}
