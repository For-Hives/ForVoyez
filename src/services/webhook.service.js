// methode to save webhooks in the database with prisma
import { updateCredits } from '@/services/database.service'
import { prisma } from '@/services/prisma.service'

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

	console.info(
		'processing webhook : ',
		webhook.eventName.toString(),
		' || content : ',
		webhook.body.toString()
	)

	// switch
	switch (webhook.eventName) {
		case 'order_created':
			await processOrderCreated(parsed_webhook)
			break
		case 'subscription_cancelled':
			await processSubscriptionCancelled(parsed_webhook)
			break
		case 'subscription_created':
			await processSubscriptionCreated(parsed_webhook)
			break
		case 'subscription_payment_success':
			await processSubscriptionPaymentSuccess(parsed_webhook)
			break
		case 'subscription_plan_changed':
			await processSubscriptionPlanChanged(parsed_webhook)
			break
		case 'subscription_resumed':
			await processSubscriptionResumed(parsed_webhook)
			break
		case 'subscription_updated':
			// nothing to do
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

	console.info('webhook saved in the database')
	return webhook.id
}

// private function to process the webhook "order_created" (used in case of refill buy)
async function processOrderCreated(parsed_webhook) {
	const userId = parsed_webhook.meta.custom_data.user_id // Clerk user ID
	const customerEmail = parsed_webhook.data.attributes.user_email
	const customerName = parsed_webhook.data.attributes.user_name
	const customerId = parsed_webhook.data.attributes.customer_id // Lemon Squeezy customer ID

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
				customerId: customerId,
				email: customerEmail,
				name: customerName,
				clerkId: userId,
			},
		})
	} else if (!user.customerId) {
		// update the user's customerId if it's not already set
		await prisma.user.update({
			data: { customerId: customerId },
			where: { clerkId: userId },
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
			user.clerkId,
			plan ? plan.packageSize : 0,
			null,
			'Order created'
		)
	}
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

async function processSubscriptionCreated(webhook) {
	// Get the user based on the Clerk user ID
	const user = await prisma.user.findUnique({
		where: {
			clerkId: webhook.meta.custom_data.user_id,
		},
	})

	if (user) {
		// Update the user's customerId if it's not already set
		if (!user.customerId) {
			await prisma.user.update({
				data: { customerId: webhook.data.attributes.customer_id.toString() },
				where: { clerkId: webhook.meta.custom_data.user_id },
			})
		}
	} else {
		console.error(
			'User not found for userId:',
			webhook.meta.custom_data.user_id
		)
	}

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

// private function to process the webhook "subscription_payment_success", to add credits to the user,
// used in case of subscription payment success
async function processSubscriptionPaymentSuccess(webhook) {
	// Extract the Clerk user ID and Lemon Squeezy subscription ID from the webhook data
	const userId = webhook.meta.custom_data.user_id
	const subscriptionId = webhook.data.attributes.subscription_id

	// Find the user in the database based on the Clerk user ID
	const user = await prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
	})

	// If the user is not found, log an error and return
	if (!user) {
		console.error('User not found for userId:', userId)
		return
	}

	// If the user doesn't have a customerId, log an error and return
	if (!user.customerId) {
		console.error('CustomerId not found for user:', user)
		return
	}

	// Find the user's existing subscription (if any) in the database
	const existingSubscription = await prisma.subscription.findFirst({
		where: {
			userId: user.id,
		},
		include: {
			plan: true,
		},
	})

	// If an existing subscription is found
	if (existingSubscription) {
		// If the existing subscription has an oldPlanId (indicating a plan change)
		if (existingSubscription.oldPlanId) {
			// Retrieve the old plan from the database using the oldPlanId
			const oldPlan = await prisma.plan.findUnique({
				where: {
					id: existingSubscription.oldPlanId,
				},
			})

			// Find the new subscription associated with the current Lemon Squeezy subscription ID
			const newSubscription = await prisma.subscription.findFirst({
				where: {
					lemonSqueezyId: subscriptionId.toString(),
				},
				include: {
					plan: true,
				},
			})

			// If both the old plan and new subscription are found
			if (oldPlan && newSubscription) {
				// Calculate the difference in package size between the new and old plans
				const packageDifference =
					newSubscription.plan.packageSize - oldPlan.packageSize

				// Update the user's credits based on the package difference and log the reason
				await updateCredits(
					user.clerkId,
					packageDifference,
					null,
					'Subscription payment success (plan change)'
				)
			}
		} else {
			// If there is no oldPlanId, retrieve the current plan from the database
			const newPlan = await prisma.plan.findUnique({
				where: {
					id: existingSubscription.planId,
				},
			})

			// If the current plan is found
			if (newPlan) {
				// Update the user's credits based on the current plan's package size and log the reason
				await updateCredits(
					user.clerkId,
					newPlan.packageSize,
					null,
					'Subscription payment success'
				)
			}
		}
	} else {
		// If no existing subscription is found, find the subscription associated with the current Lemon Squeezy subscription ID
		const sub = await prisma.subscription.findFirst({
			where: {
				lemonSqueezyId: subscriptionId.toString(),
			},
			include: {
				plan: true,
			},
		})

		// If the subscription is found
		if (sub) {
			// Update the user's credits based on the new subscription's plan package size and log the reason
			await updateCredits(
				user.clerkId,
				sub.plan.packageSize ?? 0,
				null,
				'Subscription payment success (new plan)'
			)
		}
	}
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
