// model WebhookEvent {
//     id              Int      @id
//     createdAt       DateTime @default(now())
//     eventName       String
//     processed       Boolean  @default(false)
//     body            String
//     userId          String
//     processingError String?
//
//         users User @relation(fields: [userId], references: [clerkId])
// }

// {
//     meta: {
//         test_mode: true,
//             event_name: 'subscription_payment_success',
//             custom_data: { user_id: 'user_2fbQY8pEL1xMjNPUKkf7dgB4iIX' },
//         webhook_id: '031c38ce-a855-48f0-a461-13738db4faba'
//     },
//     data: {
//         type: 'subscription-invoices',
//             id: '906649',
//             attributes: {
//             store_id: 84282,
//                 subscription_id: 352649,
//                 customer_id: 2724989,
//                 user_name: 'bebou bebooo',
//                 user_email: 'breval2000@live.fr',
//                 billing_reason: 'initial',
//                 card_brand: 'visa',
//                 card_last_four: '4242',
//                 currency: 'EUR',
//                 currency_rate: '1.07351195',
//                 status: 'paid',
//                 status_formatted: 'Paid',
//                 refunded: false,
//                 refunded_at: null,
//                 subtotal: 1000,
//                 discount_total: 0,
//                 tax: 167,
//                 tax_inclusive: true,
//                 total: 1000,
//                 subtotal_usd: 1074,
//                 discount_total_usd: 0,
//                 tax_usd: 179,
//                 total_usd: 1074,
//                 subtotal_formatted: '€10.00',
//                 discount_total_formatted: '€0.00',
//                 tax_formatted: '€1.67',
//                 total_formatted: '€10.00',
//                 urls: [Object],
//                 created_at: '2024-04-25T17:53:26.000000Z',
//                 updated_at: '2024-04-25T17:53:31.000000Z',
//                 test_mode: true
//         },
//         relationships: { store: [Object], subscription: [Object], customer: [Object] },
//         links: {
//             self: 'https://api.lemonsqueezy.com/v1/subscription-invoices/906649'
//         }
//     }
// }

// methode to save webhooks in the database with prisma
import { updateCreditForUser } from '@/services/database.service'
import { prisma } from '@/services/prisma.service'

export async function saveWebhooks(webhooks) {
	// save the webhooks in the database
	const webhook = await prisma.webhookEvent.create({
		data: {
			eventName: webhooks.meta.event_name,
			body: JSON.stringify(webhooks),
			userId: webhooks.meta.custom_data.user_id,
			customerId: webhooks.data.attributes.customer_id,
		},
	})

	return webhook.id
}

// methode to process the webhooks #id
export async function processWebhook(id) {
	// get the webhook by id
	const webhook = await prisma.webhookEvent.findUnique({
		where: {
			id: id,
		},
	})

	// todo : check if the webhook is already processed
	if (!webhook) {
		return
	}
	// process the webhook
	const parsed_webhook = JSON.parse(webhook.body)

	// switch
	switch (webhook.eventName) {
		case 'order_created':
			break
		case 'subscription_created':
			await processSubscriptionCreated(parsed_webhook)
			break
		case 'subscription_payment_success':
			await processSubscriptionPaymentSuccess(parsed_webhook)
			break
		case 'subscription_updated':
			break
	}

	// if the webhook is processed, update the webhook
	if (webhook) {
		prisma.webhookEvent.update({
			where: {
				id: id,
			},
			data: {
				processed: true,
			},
		})
	}
}

// private function to process the webhook "subscription_payment_success", to add credits to the user
async function processSubscriptionPaymentSuccess(webhook) {
	// find witch plan is linked to the variantId
	const sub = await prisma.subscription.findFirst({
		where: {
			lemonSqueezyId: webhook.data.attributes.subscription_id.toString(),
		},
		include: {
			plans: true,
		},
	})

	// update the user credits
	await updateCreditForUser(sub.userId, sub.plans.packageSize ?? 0)
}

async function processSubscriptionCreated(webhook) {
	// link plan with variantId
	const plan = await prisma.plan.findUnique({
		where: {
			variantId: webhook.data.attributes.variant_id.toString(),
		},
	})

	// create a new subscription in the database for the user
	const subscription = await prisma.subscription.create({
		data: {
			lemonSqueezyId: webhook.data.id,
			orderId: webhook.data.attributes.order_id,
			name: webhook.data.attributes.user_name,
			email: webhook.data.attributes.user_email,
			status: webhook.data.attributes.status,
			statusFormatted: webhook.data.attributes.status_formatted,
			renewsAt: webhook.data.attributes.renews_at,
			endsAt: webhook.data.attributes.ends_at,
			trialEndsAt: webhook.data.attributes.trial_ends_at,
			isUsageBased: false,
			isPaused: false,
			userId: webhook.meta.custom_data.user_id,
			planId: plan.id,
			customerId: webhook.data.attributes.customer_id.toString(),
		},
	})
}
