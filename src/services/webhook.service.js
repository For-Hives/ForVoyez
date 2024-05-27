// methode to save webhooks in the database with prisma
import { updateCredits } from '@/services/database.service'
import { prisma } from '@/services/prisma.service'

export async function saveWebhooks(webhooks) {
	// save the webhooks in the database
	const webhook = await prisma.webhookEvent.create({
		data: {
			customerId: webhooks.data.attributes.customer_id,
			userId: webhooks.meta.custom_data.user_id,
			eventName: webhooks.meta.event_name,
			body: JSON.stringify(webhooks),
		},
	})

	return webhook.id
}

// methode to process the webhooks #id
export async function processWebhook(id) {
	// get the webhook by id
	const webhook = await prisma.webhookEvent.findUnique({
		where: { id: id },
	})

	if (!webhook) {
		return
	}

	// process the webhook
	const parsed_webhook = JSON.parse(webhook.body)

	// switch
	switch (webhook.eventName) {
		case 'order_created':
			await processOrderCreated(parsed_webhook)
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
			data: { processed: true },
			where: { id: id },
		})
	}
}

// private function to process the webhook "order_created" (used in case of refill buy)
async function processOrderCreated(parsed_webhook) {
	const userId = parsed_webhook.meta.custom_data.user_id // Clerk user ID
	const customerEmail = parsed_webhook.data.attributes.user_email
	const customerName = parsed_webhook.data.attributes.user_name
	const customerId = parsed_webhook.data.attributes.customer_id.toString() // Lemon Squeezy customer ID

	// check if the user already exists
	let user = await prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
	})

	if (!user) {
		// create a new user in the database if they don't exist
		user = await prisma.user.create({
			data: {
				customerId: customerId, // Store the Lemon Squeezy customer ID
				email: customerEmail,
				name: customerName,
				clerkId: userId,
			},
		})
	}

	// check if the order is paid
	if (parsed_webhook.data.attributes.status === 'paid') {
		// get the variant_id from the first_order_item
		const variantId =
			parsed_webhook.data.attributes.first_order_item.variant_id.toString()

		// get the plan associated with the variantId
		const plan = await prisma.plan.findUnique({
			where: {
				variantId: variantId,
			},
		})

		// add the credits to the user
		await updateCredits(
			user.id,
			plan ? plan.packageSize : 0,
			null,
			'Order created'
		)
	}
}

// private function to process the webhook "subscription_resumed", to update the status of the subscription
async function processSubscriptionResumed(webhook) {
	await prisma.subscription.update({
		data: {
			endsAt: webhook.data.attributes.ends_at,
			statusFormatted: 'Active',
			status: 'active',
			isPaused: false,
		},
		where: {
			lemonSqueezyId:
				webhook.data.attributes.first_subscription_item.subscription_id.toString(),
		},
	})
}

// private function to process the webhook "subscription_cancelled", to update the status of the subscription
async function processSubscriptionCancelled(webhook) {
	await prisma.subscription.update({
		data: {
			endsAt: webhook.data.attributes.ends_at,
			statusFormatted: 'Cancelled',
			status: 'cancelled',
		},
		where: {
			lemonSqueezyId:
				webhook.data.attributes.first_subscription_item.subscription_id.toString(),
		},
	})
}

// private function to process the webhook "subscription_plan_changed", to update the plan of the subscription
async function processSubscriptionPlanChanged(webhook) {
	// Get the subscription ID from the webhook data
	const subscriptionId =
		webhook.data.attributes.first_subscription_item?.subscription_id

	if (!subscriptionId) {
		console.error('Subscription ID not found in the webhook data')
		return
	}

	// Get the user's current subscription
	const subscription = await prisma.subscription.findFirst({
		where: {
			lemonSqueezyId: subscriptionId.toString(),
		},
		include: {
			plan: true,
		},
	})

	if (subscription) {
		// Get the new plan associated with the variantId
		const newPlan = await prisma.plan.findUnique({
			where: {
				variantId: webhook.data.attributes.variant_id.toString(),
			},
		})

		if (newPlan) {
			// Update the subscription with the new plan and the old plan
			await prisma.subscription.update({
				data: {
					oldPlanId: subscription.planId, // Save the old plan
					statusFormatted: 'Active',
					planId: newPlan.id,
					status: 'active',
				},
				where: {
					lemonSqueezyId: subscriptionId.toString(),
				},
			})
		}
	}
}

// private function to process the webhook "subscription_payment_success", to add credits to the user,
// used in case of subscription payment success
async function processSubscriptionPaymentSuccess(webhook) {
	const userId = webhook.meta.custom_data.user_id // Clerk user ID
	const subscriptionId = webhook.data.attributes.subscription_id

	// Get the user based on the Clerk user ID
	const user = await prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
	})

	if (!user) {
		console.error('User not found for userId:', userId)
		return
	}

	// Get the user's existing subscription (if any)
	const existingSubscription = await prisma.subscription.findFirst({
		where: {
			userId: user.id,
		},
		include: {
			plan: true,
		},
	})

	if (existingSubscription) {
		if (existingSubscription.oldPlanId) {
			// Retrieve the old plan from the oldPlanId field of the existing subscription
			const oldPlan = await prisma.plan.findUnique({
				where: {
					id: existingSubscription.oldPlanId,
				},
			})

			// Get the new plan associated with the current subscription
			const newSubscription = await prisma.subscription.findFirst({
				where: {
					lemonSqueezyId: subscriptionId.toString(),
				},
				include: {
					plan: true,
				},
			})

			if (oldPlan && newSubscription) {
				// Calculate the packageSize difference between the new plan and the old plan
				const packageDifference =
					newSubscription.plan.packageSize - oldPlan.packageSize

				// Update the user's credits by adding the credits difference using the updateCredits function
				await updateCredits(
					user.id,
					packageDifference,
					null,
					'Subscription payment success (plan change)'
				)
			}
		} else {
			// If there's no old plan, add the credits from the new plan
			const newPlan = await prisma.plan.findUnique({
				where: {
					id: existingSubscription.planId,
				},
			})

			if (newPlan) {
				await updateCredits(
					user.id,
					newPlan.packageSize,
					null,
					'Subscription payment success'
				)
			}
		}
	} else {
		// Find which plan is linked to the subscription ID
		const sub = await prisma.subscription.findFirst({
			where: {
				lemonSqueezyId: subscriptionId.toString(),
			},
			include: {
				plan: true,
			},
		})

		// Update the user credits
		await updateCredits(
			user.id,
			sub.plan.packageSize ?? 0,
			null,
			'Subscription payment success (new plan)'
		)
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
			customerId: webhook.data.attributes.customer_id.toString(),
			statusFormatted: webhook.data.attributes.status_formatted,
			trialEndsAt: webhook.data.attributes.trial_ends_at,
			renewsAt: webhook.data.attributes.renews_at,
			orderId: webhook.data.attributes.order_id,
			email: webhook.data.attributes.user_email,
			userId: webhook.meta.custom_data.user_id,
			name: webhook.data.attributes.user_name,
			endsAt: webhook.data.attributes.ends_at,
			status: webhook.data.attributes.status,
			lemonSqueezyId: webhook.data.id,
			isUsageBased: false,
			isPaused: false,
			planId: plan.id,
		},
	})
}
