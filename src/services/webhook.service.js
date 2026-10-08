// methode to save webhooks in the database with prisma
import { updateCredits } from '@/services/database.service'
import { prisma } from '@/services/prisma.service'

// Events that add credits. Each one pays for one Lemon Squeezy resource,
// `data.id`: the order (order_created) or the subscription invoice
// (subscription_payment_success). A redelivery of an already processed
// resource (lost 200, Lemon Squeezy retry, "Resend" from its dashboard) must
// not credit it again.
const CREDITING_EVENTS = new Set([
	'order_created',
	'subscription_payment_success',
])

// methode to process the webhooks #id
// Processing errors are recorded on the WebhookEvent row (`processingError`,
// `processed` stays false) instead of being thrown: the event is already
// stored, so Lemon Squeezy must not retry it. To replay a failed event once
// its cause is fixed, resend it from the Lemon Squeezy dashboard.
export async function processWebhook(id) {
	// get the webhook by id
	const webhook = await prisma.webhookEvent.findUnique({
		where: { id: id },
	})

	if (!webhook) {
		return
	}

	// never log the payload: it contains the customer's name and email
	console.info(`processing webhook ${id}: ${webhook.eventName}`)

	try {
		// process the webhook
		const parsed_webhook = JSON.parse(webhook.body)

		const duplicateOf = await findProcessedDuplicate(webhook, parsed_webhook)
		if (duplicateOf) {
			console.info(
				`webhook ${id} (${webhook.eventName}): duplicate of processed webhook ${duplicateOf.id}, skipped`
			)
			await prisma.webhookEvent.update({
				data: {
					processingError: `Duplicate of webhook event ${duplicateOf.id}, already processed: skipped`,
					processed: true,
				},
				where: { id: id },
			})
			return
		}

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
	} catch (error) {
		// Prisma errors can echo the query arguments (customer name/email): log
		// only the error kind, the full message goes to the WebhookEvent row.
		console.error(
			`webhook ${id} (${webhook.eventName}) processing failed:`,
			error.code ?? error.name
		)
		await prisma.webhookEvent.update({
			data: { processingError: String(error.message ?? error) },
			where: { id: id },
		})
		return
	}

	// the webhook is processed, update the webhook
	await prisma.webhookEvent.update({
		data: { processed: true },
		where: { id: id },
	})
}

export async function saveWebhooks(webhooks) {
	// save the webhooks in the database
	const webhook = await prisma.webhookEvent.create({
		data: {
			customerId: toIntOrNull(webhooks.data.attributes.customer_id),
			userId: webhooks.meta.custom_data.user_id,
			eventName: webhooks.meta.event_name,
			body: JSON.stringify(webhooks),
		},
	})

	console.info('webhook saved in the database')
	return webhook.id
}

// Returns an earlier, already processed delivery of the same crediting event
// for the same Lemon Squeezy resource (`data.id`), or null. Failed deliveries
// (`processed` false) do not count, so a fixed event can be resent.
// Not a lock: two deliveries processed at the very same time can both pass
// (Lemon Squeezy retries only after a failed or timed out answer).
async function findProcessedDuplicate(webhook, parsed_webhook) {
	const resourceId = parsed_webhook.data?.id
	if (!CREDITING_EVENTS.has(webhook.eventName) || resourceId == null) {
		return null
	}

	// a user only has a handful of these events: compare the stored payloads
	const processedEvents = await prisma.webhookEvent.findMany({
		where: {
			eventName: webhook.eventName,
			id: { not: webhook.id },
			userId: webhook.userId,
			processed: true,
		},
		select: { body: true, id: true },
		orderBy: { id: 'asc' },
	})

	return (
		processedEvents.find(
			event => String(parseBody(event.body)?.data?.id) === String(resourceId)
		) ?? null
	)
}

// True when a processed subscription_plan_changed event moved this
// subscription to its current plan. A plan change marker (`oldPlanId`) set by
// this version always has one. The version before it set `oldPlanId` at every
// plan change, never cleared it and never marked its webhook events
// processed: such a stale marker must not be taken for the plan change of a
// new `updated` invoice that arrives before its subscription_plan_changed.
async function hasProcessedPlanChange(subscription, userId) {
	// a user only has a handful of these events: compare the stored payloads
	const planChanges = await prisma.webhookEvent.findMany({
		where: {
			eventName: 'subscription_plan_changed',
			processed: true,
			userId: userId,
		},
		select: { body: true },
	})

	return planChanges.some(event => {
		const attributes = parseBody(event.body)?.data?.attributes
		return (
			String(attributes?.first_subscription_item?.subscription_id) ===
				subscription.lemonSqueezyId &&
			String(attributes?.variant_id) === subscription.plan?.variantId
		)
	})
}

function parseBody(body) {
	try {
		return JSON.parse(body)
	} catch {
		return null
	}
}

// private function to process the webhook "order_created": credits a paid
// order, i.e. a one-time credit pack OR the first payment of a new
// subscription (Lemon Squeezy always sends order_created with
// subscription_created). The first subscription payment also triggers
// subscription_payment_success (billing_reason "initial"), which is skipped
// there so it is credited only once, here.
async function processOrderCreated(parsed_webhook) {
	const userId = parsed_webhook.meta.custom_data.user_id // Clerk user ID
	const customerId = toIntOrNull(parsed_webhook.data.attributes.customer_id) // Lemon Squeezy customer ID

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

		if (!plan) {
			throw new Error(
				`Plan not found for variant ${variantId}, sync the plans (/api/sync) and reprocess`
			)
		}

		// add the credits to the user
		await updateCredits(
			user.clerkId,
			plan.packageSize ?? 0,
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
				data: {
					// User.customerId is an Int column
					customerId: toIntOrNull(webhook.data.attributes.customer_id),
				},
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
	const variantId = webhook.data.attributes.variant_id.toString()
	const plan = await prisma.plan.findUnique({
		where: {
			variantId: variantId,
		},
	})

	if (!plan) {
		throw new Error(
			`Plan not found for variant ${variantId}, sync the plans (/api/sync) and reprocess`
		)
	}

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

// private function to process the webhook "subscription_payment_success": adds
// the credits paid by one invoice of a subscription, by billing reason:
// - "initial": first payment, already credited by order_created (skipped)
// - "updated": immediate invoice after a plan change, the current period was
//   already credited with the old plan: add the extra credits of the new plan
//   only (never negative). Fails while subscription_plan_changed is not
//   processed yet (no `oldPlanId`, or one left by the previous version, see
//   hasProcessedPlanChange), so the invoice can be resent after it.
// - "renewal" (and any other reason): a new period, the full current plan
// The plan change marker (`oldPlanId`, set by subscription_plan_changed) is
// cleared once an invoice is credited, so it is used at most once.
async function processSubscriptionPaymentSuccess(webhook) {
	// Extract the Clerk user ID and Lemon Squeezy subscription ID from the webhook data
	const userId = webhook.meta.custom_data.user_id
	const subscriptionId = webhook.data.attributes.subscription_id
	const billingReason = webhook.data.attributes.billing_reason

	// The initial payment of a subscription is credited by order_created (sent
	// with every purchase, it carries the variant and does not depend on
	// subscription_created having been processed first).
	if (billingReason === 'initial') {
		console.info(
			`subscription ${subscriptionId}: initial payment already credited by order_created`
		)
		return
	}

	// Find the user in the database based on the Clerk user ID
	const user = await prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
	})

	// Nothing is credited: fail (processed stays false, processingError set) so
	// the invoice can be resent once the user is fixed, instead of marking it
	// processed, which would make a resend a skipped duplicate.
	if (!user) {
		throw new Error(`User ${userId} not found, invoice not credited`)
	}

	if (!user.customerId) {
		throw new Error(
			`CustomerId not set for user ${user.clerkId}, invoice not credited`
		)
	}

	// The subscription this invoice pays, with its current plan
	const subscription = await prisma.subscription.findUnique({
		where: {
			lemonSqueezyId: String(subscriptionId),
		},
		include: {
			plan: true,
		},
	})

	if (!subscription) {
		throw new Error(
			`Subscription ${subscriptionId} not found, process its subscription_created event and reprocess`
		)
	}

	const packageSize = subscription.plan?.packageSize ?? 0

	if (billingReason === 'updated') {
		// Lemon Squeezy does not order its webhooks: without the plan change
		// marker the extra credits are unknown. Fail so this invoice can be
		// resent once subscription_plan_changed is processed (crediting 0 would
		// mark it processed and a resend would be skipped as a duplicate).
		if (
			!subscription.oldPlanId ||
			!(await hasProcessedPlanChange(subscription, userId))
		) {
			throw new Error(
				`Subscription ${subscriptionId}: plan change not processed yet, resend this invoice after its subscription_plan_changed event`
			)
		}
		const oldPlan = await prisma.plan.findUnique({
			where: { id: subscription.oldPlanId },
		})
		const extraCredits = oldPlan
			? Math.max(0, packageSize - (oldPlan.packageSize ?? 0))
			: 0

		if (extraCredits > 0) {
			await updateCredits(
				user.clerkId,
				extraCredits,
				null,
				'Subscription payment success (plan change)'
			)
		} else {
			console.info(
				`subscription ${subscriptionId}: plan change invoice, no extra credits`
			)
		}
	} else {
		await updateCredits(
			user.clerkId,
			packageSize,
			null,
			'Subscription payment success'
		)
	}

	if (subscription.oldPlanId) {
		await prisma.subscription.update({
			where: {
				lemonSqueezyId: String(subscriptionId),
			},
			data: { oldPlanId: null },
		})
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

	if (!subscription) {
		throw new Error(
			`Subscription ${subscriptionId} not found, process its subscription_created event and reprocess`
		)
	}

	// Get the new plan associated with the variantId
	const variantId = webhook.data.attributes.variant_id.toString()
	const newPlan = await prisma.plan.findUnique({
		where: {
			variantId: variantId,
		},
	})

	if (!newPlan) {
		throw new Error(
			`Plan not found for variant ${variantId}, sync the plans (/api/sync) and reprocess`
		)
	}

	// Already on this plan: a redelivery of this event. Overwriting the old
	// plan with the current one would lose the extra credits of the upgrade.
	if (subscription.planId === newPlan.id) {
		console.info(
			`subscription ${subscriptionId}: already on plan ${newPlan.id}, plan change skipped`
		)
		return
	}

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

// Lemon Squeezy ids are integers; Int columns must not receive strings.
function toIntOrNull(value) {
	const number = Number(value)
	return value == null || !Number.isInteger(number) ? null : number
}
