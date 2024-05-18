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
	console.log('Processing webhook', id)
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
			// nothing to do
			break
		case 'subscription_created':
			await processSubscriptionCreated(parsed_webhook)
			break
		case 'subscription_payment_success':
			await processSubscriptionPaymentSuccess(parsed_webhook)
			break
		case 'subscription_resumed':
			await processSubscriptionResumed(parsed_webhook)
			break
		case 'subscription_cancelled':
			await processSubscriptionCancelled(parsed_webhook)
			break
		case 'subscription_updated':
			// nothing to do
			break
		case 'subscription_plan_changed':
			await processSubscriptionPlanChanged(parsed_webhook)
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

// private function to process the webhook "subscription_plan_changed", to update the plan of the subscription
async function processSubscriptionResumed(webhook) {
	console.log('Subscription resumed', webhook)
	// update the db to reactivate the status of the subscription
	await prisma.subscription.update({
		where: {
			lemonSqueezyId:
				webhook.data.attributes.first_subscription_item.subscription_id.toString(),
		},
		data: {
			status: 'active',
			statusFormatted: 'Active',
			isPaused: false,
			endsAt: webhook.data.attributes.ends_at,
		},
	})
}

// private function to process the webhook "subscription_cancelled", to update the status of the subscription
async function processSubscriptionCancelled(webhook) {
	console.log('Subscription cancelled', webhook)
	// update the db to cancel the status of the subscription
	console.log(webhook.data.attributes)
	await prisma.subscription.update({
		where: {
			lemonSqueezyId:
				webhook.data.attributes.first_subscription_item.subscription_id.toString(),
		},
		data: {
			status: 'cancelled',
			statusFormatted: 'Cancelled',
			endsAt: webhook.data.attributes.ends_at,
		},
	})
}

// private function to process the webhook "subscription_plan_changed", to update the plan of the subscription
async function processSubscriptionPlanChanged(webhook) {
	console.log('Plan changed', webhook)
	// link plan with variantId
	const plan = await prisma.plan.findUnique({
		where: {
			variantId: webhook.data.attributes.variant_id.toString(),
		},
	})

	// update the db to change the plan of the subscription
	await prisma.subscription.update({
		where: {
			lemonSqueezyId:
				webhook.data.attributes.first_subscription_item.subscription_id.toString(),
		},
		data: {
			planId: plan.id,
			status: 'active',
			statusFormatted: 'Active',
		},
	})
}

// // private function to process the webhook "subscription_payment_success", to add credits to the user
// async function processSubscriptionPaymentSuccess(webhook) {
// 	// find witch plan is linked to the variantId
// 	const sub = await prisma.subscription.findFirst({
// 		where: {
// 			lemonSqueezyId: webhook.data.attributes.subscription_id.toString(),
// 		},
// 		include: {
// 			plans: true,
// 		},
// 	})
//
// 	// update the user credits
// 	await updateCreditForUser(sub.userId, sub.plans.packageSize ?? 0)
// }
// private function to process the webhook "subscription_payment_success", to add credits to the user
async function processSubscriptionPaymentSuccess(webhook) {
	console.log('Payment success', webhook)

	// Ensure webhook data is present and valid
	if (!webhook.data || !webhook.data.attributes) {
		console.error('Invalid webhook data: Missing data or attributes')
		return
	}

	const customerId = webhook.meta.custom_data.user_id
	const subscriptionId = webhook.data.attributes.subscription_id.toString()

	// Get the user based on the customerId
	const user = await prisma.user.findUnique({
		where: {
			clerkId: customerId,
		},
		include: {
			subscriptions: true,
		},
	})

	if (!user) {
		console.error('User not found for customerId:', customerId)
		return
	}

	// Get the user's existing subscription (if any)
	const existingSubscription = user.subscriptions.find(
		sub => sub.lemonSqueezyId === subscriptionId
	)

	if (!existingSubscription) {
		console.error(
			'No existing subscription found for subscriptionId:',
			subscriptionId
		)
		return
	}

	// Get the new plan id from the attributes (if available)
	const newPlanId = webhook.data.attributes.variant_id

	if (!newPlanId) {
		console.error('Invalid subscription data: Missing new plan ID')
		return
	}

	// Get the old plan associated with the existing subscription
	const oldPlan = await prisma.plan.findUnique({
		where: {
			id: existingSubscription.planId,
		},
	})

	// Get the new plan associated with the current subscription
	const newPlan = await prisma.plan.findUnique({
		where: {
			id: newPlanId,
		},
	})

	if (!oldPlan || !newPlan) {
		console.error('Old plan or new plan not found')
		return
	}

	// Calculate the price difference between the new plan and the old plan
	const priceDifference = newPlan.price - oldPlan.price

	// If the price difference is negative, the user is downgrading, so no credits are added
	if (priceDifference < 0) {
		console.warn('Downgrade detected: No credits added')
		return
	}

	// Calculate the credits to add to the user, based on the package size of the new plan minus the package size of the old plan
	const creditsDifference = newPlan.packageSize - oldPlan.packageSize

	// Update the user's credits by adding the credits difference using the updateCreditForUser function
	await updateCreditForUser(customerId, creditsDifference)
}

async function processSubscriptionCreated(webhook) {
	// link plan with variantId
	console.log('Subscription created', webhook)
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
