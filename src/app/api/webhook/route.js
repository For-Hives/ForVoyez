import { createHmac, timingSafeEqual } from 'crypto'

import { processWebhook, saveWebhooks } from '@/services/webhook.service'

const WEBHOOK_SECRET = () => process.env.LEMON_SQUEEZY_WEBHOOK_SECRET

export async function POST(request) {
	let webhookId
	let eventName
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

		const payload = parseJson(rawBody)
		if (!isStorable(payload)) {
			console.error(
				`webhook rejected: malformed payload (event ${String(payload?.meta?.event_name)})`
			)
			return new Response('Malformed webhook payload', {
				status: 400,
			})
		}
		eventName = payload.meta.event_name

		// Store the event (each delivery is kept, processed or not)
		webhookId = await saveWebhooks(payload)
	} catch (error) {
		// never log the body: it contains the customer's name and email (and
		// Prisma/JSON errors can quote it), so only log the error kind
		console.error('Webhook error:', error.code ?? error.name)
		return new Response('Webhook error', {
			status: 500,
		})
	}

	// Processing is idempotent (a delivery of an event already processed is
	// skipped) and all-or-nothing: on failure, answer an error so Lemon
	// Squeezy retries the delivery.
	let processed = false
	try {
		processed = await processWebhook(webhookId)
	} catch (error) {
		// processWebhook records processing errors itself: this one could not
		// even be recorded (database unreachable...)
		console.error(
			`webhook ${webhookId} (${eventName}) error:`,
			error.code ?? error.name
		)
	}

	if (!processed) {
		console.error(
			`webhook ${webhookId} (${eventName}) not processed, answering 500 so Lemon Squeezy retries it; the error is in WebhookEvent.processingError`
		)
		return new Response('Webhook processing failed', {
			status: 500,
		})
	}

	return new Response('Success!', {
		status: 200,
	})
}

// True when the Lemon Squeezy event has what is needed to store it: its name,
// its data and the Clerk user id its checkout carries (`custom_data`, set by
// getCheckoutsLinks).
function isStorable(payload) {
	return (
		typeof payload?.meta?.event_name === 'string' &&
		typeof payload.meta.custom_data?.user_id === 'string' &&
		payload.meta.custom_data.user_id !== '' &&
		typeof payload.data?.attributes === 'object' &&
		payload.data.attributes !== null
	)
}

function parseJson(rawBody) {
	try {
		return JSON.parse(rawBody)
	} catch {
		return null
	}
}
