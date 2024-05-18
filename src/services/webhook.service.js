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
	// update the db to cancel the status of the subscription
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

// private function to process the webhook "subscription_payment_success", to add credits to the user
async function processSubscriptionPaymentSuccess(webhook) {
	const customerId = webhook.meta.custom_data.user_id
	const subscriptionId = webhook.data.attributes.subscription_id

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
	const existingSubscription = user.subscriptions[0]

	if (existingSubscription) {
		// Get the old plan associated with the existing subscription
		const oldPlan = await prisma.plan.findUnique({
			where: {
				id: existingSubscription.planId,
			},
		})

		// Get the new plan associated with the current subscription
		const newSubscription = await prisma.subscription.findFirst({
			where: {
				lemonSqueezyId: subscriptionId.toString(),
			},
			include: {
				plans: true,
			},
		})

		if (oldPlan && newSubscription) {
			// Calculate the packageSize difference between the new plan and the old plan
			const packageDifference =
				newSubscription.plans.packageSize - oldPlan.packageSize
			// Update the user's credits by adding the credits difference using the updateCreditForUser function
			await updateCreditForUser(customerId, packageDifference)
		}
	} else {
		// Find which plan is linked to the subscription ID
		const sub = await prisma.subscription.findFirst({
			where: {
				lemonSqueezyId: subscriptionId.toString(),
			},
			include: {
				plans: true,
			},
		})

		// Update the user credits
		await updateCreditForUser(sub.userId, sub.plans.packageSize ?? 0)
	}
}

async function processSubscriptionCreated(webhook) {
	// link plan with variantId
	const plan = await prisma.plan.findUnique({
		where: {
			variantId: webhook.data.attributes.variant_id.toString(),
		},
	})

	// create a new subscription in the database for the user
	await prisma.subscription.create({
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

// Private function to calculate the credits based on the amount paid
function calculateCredits(amountPaid) {
	// Example conversion rate: 1 credit per €1. Adjust this according to your business logic.
	const conversionRate = 1 // 1 credit per €1
	return amountPaid * conversionRate
}
