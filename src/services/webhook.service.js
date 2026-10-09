// methode to save webhooks in the database with prisma
import { updateCredits } from '@/services/database.service'
import { ensureUser } from '@/services/ensureUser.service'
import { logger } from '@/services/logger.service'
import { prisma } from '@/services/prisma.service'

// Events that add credits. Each one pays for one Lemon Squeezy resource,
// `data.id`: the order (order_created) or the subscription invoice
// (subscription_payment_success). A redelivery of an already processed
// resource (lost 200, Lemon Squeezy retry, "Resend" from its dashboard) must
// not credit it again.
const CREDITING_EVENTS = new Set(['order_created', 'subscription_payment_success'])

// Note stored on a processed subscription_updated event that moved its
// subscription to another plan (see processSubscriptionUpdated): the plan
// change marker of the next `updated` invoice (see hasProcessedPlanChange).
const PLAN_CHANGE_NOTE = 'Plan change applied'

// Lemon Squeezy creates an `updated` invoice during its plan change
// (`invoice_immediately`): its `created_at` is close to the `updated_at` of
// the plan change event. A processed plan change further away is an older one
// whose marker no invoice used (see hasProcessedPlanChange).
const PLAN_CHANGE_INVOICE_WINDOW_MS = 60 * 60 * 1000

// One event is processed in one transaction, under a lock (see processWebhook).
// READ COMMITTED (the PostgreSQL default, made explicit): each query sees what
// was committed before it ran, so a delivery that waited for the lock sees the
// event its twin just marked processed. A snapshot taken at the start of the
// transaction (REPEATABLE READ) would not. The timeout includes the lock wait.
const TRANSACTION_OPTIONS = {
	isolationLevel: 'ReadCommitted',
	timeout: 15_000,
	maxWait: 5_000,
}

// methode to process the webhooks #id
// Returns true once the event is processed (or skipped as a duplicate of a
// processed one), false when processing failed. Everything an event changes
// (credits, Usage row, subscription, `processed` flag) is written in a single
// transaction: a failure leaves nothing behind but the error, recorded on the
// WebhookEvent row (`processingError`, `processed` stays false). The route
// then answers an error, so Lemon Squeezy retries the delivery (up to 3 more
// times, after about 5 s, 25 s and 125 s); after that, resend it from the
// Lemon Squeezy dashboard once its cause is fixed. Each delivery is stored as
// its own WebhookEvent row.
export async function processWebhook(id) {
	// get the webhook by id
	const webhook = await prisma.webhookEvent.findUnique({
		where: { id: id },
	})

	if (!webhook) {
		return false
	}

	// never log the payload: it contains the customer's name and email
	logger.info(`processing webhook ${id}: ${webhook.eventName}`)

	let duplicateOf
	try {
		duplicateOf = await prisma.$transaction(tx => processInTransaction(tx, webhook), TRANSACTION_OPTIONS)
	} catch (error) {
		// Prisma errors can echo the query arguments (customer name/email): log
		// only the error kind, the full message goes to the WebhookEvent row.
		console.error(`webhook ${id} (${webhook.eventName}) processing failed:`, error.code ?? error.name)
		await recordProcessingError(id, error)
		return false
	}

	if (duplicateOf) {
		logger.info(`webhook ${id} (${webhook.eventName}): duplicate of processed webhook ${duplicateOf.id}, skipped`)
	}
	return true
}

export async function saveWebhooks(webhooks) {
	const userId = webhooks.meta.custom_data.user_id
	const customerId = toIntOrNull(webhooks.data.attributes.customer_id)

	// WebhookEvent.userId references User.clerkId. The dashboard creates the
	// User row without waiting for it (LayoutApp): if that failed, the event of
	// a paid order could not be stored at all, so create the user here.
	await ensureUser({ clerkId: userId, customerId })

	// save the webhooks in the database
	const webhook = await prisma.webhookEvent.create({
		data: {
			eventName: webhooks.meta.event_name,
			body: JSON.stringify(webhooks),
			customerId,
			userId,
		},
	})

	logger.info('webhook saved in the database')
	return webhook.id
}

// Returns an earlier, already processed delivery of the same crediting event
// (same idempotency key), or null. Failed deliveries (`processed` false)
// changed nothing (rolled back), so they do not count: a retry or a resend
// of a failed event is processed. Run under the lock of the key.
async function findProcessedDuplicate(tx, webhook, parsed_webhook) {
	const key = idempotencyKey(webhook.eventName, parsed_webhook)
	if (!key) {
		return null
	}

	// a user only has a handful of these events: compare the stored payloads
	const processedEvents = await tx.webhookEvent.findMany({
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
			// same event name: the query filters on it
			event => idempotencyKey(webhook.eventName, parseBody(event.body)) === key
		) ?? null
	)
}

// True when a processed subscription_updated or subscription_plan_changed
// event of the same subscription is more recent (Lemon Squeezy's
// `updated_at`) than this one: a late delivery or a Resend of an old state
// must not move the subscription back to its previous plan.
async function hasNewerProcessedUpdate(tx, event, payload, subscriptionId) {
	const updatedAt = Date.parse(payload.data?.attributes?.updated_at)
	if (Number.isNaN(updatedAt)) {
		return false
	}

	const updates = await tx.webhookEvent.findMany({
		where: {
			eventName: { in: ['subscription_updated', 'subscription_plan_changed'] },
			id: { not: event.id },
			userId: event.userId,
			processed: true,
		},
		select: { eventName: true, body: true },
	})

	return updates.some(update => {
		const other = parseBody(update.body)
		return (
			planChangeSubscriptionId(update.eventName, other) === subscriptionId &&
			Date.parse(other?.data?.attributes?.updated_at) > updatedAt
		)
	})
}

// True when a processed plan change moved this subscription to its current
// plan, at the time the `updated` invoice was created (`invoiceCreatedAt`,
// within PLAN_CHANGE_INVOICE_WINDOW_MS): a subscription_plan_changed event, or
// a subscription_updated event that changed the plan (it carries
// PLAN_CHANGE_NOTE; the other, routine subscription_updated events do not
// count). A plan change marker (`oldPlanId`) set by this version always has
// one. Two kinds of markers must not be taken for the plan change of a new
// `updated` invoice that arrives before its plan change:
// - one left by the version before it, which set `oldPlanId` at every plan
//   change, never cleared it and never marked its webhook events processed;
// - one left by an older plan change that sent no `updated` invoice (a
//   downgrade, or proration billed at the renewal): its plan change is
//   processed, but hours or days before this invoice.
async function hasProcessedPlanChange(tx, subscription, userId, invoiceCreatedAt) {
	// a user only has a handful of these events: compare the stored payloads
	const planChanges = await tx.webhookEvent.findMany({
		where: {
			OR: [
				{ eventName: 'subscription_plan_changed' },
				{
					processingError: { startsWith: PLAN_CHANGE_NOTE },
					eventName: 'subscription_updated',
				},
			],
			processed: true,
			userId: userId,
		},
		select: { eventName: true, body: true },
	})

	return planChanges.some(event => {
		const payload = parseBody(event.body)
		return (
			planChangeSubscriptionId(event.eventName, payload) === subscription.lemonSqueezyId &&
			String(payload?.data?.attributes?.variant_id) === subscription.plan?.variantId &&
			isCloseInTime(payload?.data?.attributes?.updated_at, invoiceCreatedAt)
		)
	})
}

// The idempotency key of a crediting event: its name and the Lemon Squeezy
// resource it pays for (`data.id`, see CREDITING_EVENTS), the same in every
// delivery of the event. Null for the other events, whose writes can be
// repeated safely.
function idempotencyKey(eventName, parsed_webhook) {
	const resourceId = parsed_webhook?.data?.id
	if (!CREDITING_EVENTS.has(eventName) || resourceId == null) {
		return null
	}
	return `lemonsqueezy:${eventName}:${resourceId}`
}

// True when the two Lemon Squeezy dates are at most
// PLAN_CHANGE_INVOICE_WINDOW_MS apart. Lemon Squeezy always sends both; a
// payload without them (stored by hand) is not checked.
function isCloseInTime(changedAt, invoiceCreatedAt) {
	const changed = Date.parse(changedAt)
	const invoiced = Date.parse(invoiceCreatedAt)
	if (Number.isNaN(changed) || Number.isNaN(invoiced)) {
		return true
	}
	return Math.abs(invoiced - changed) <= PLAN_CHANGE_INVOICE_WINDOW_MS
}

function parseBody(body) {
	try {
		return JSON.parse(body)
	} catch {
		return null
	}
}

// The Lemon Squeezy subscription id of a plan change event, as stored in
// Subscription.lemonSqueezyId: `data.id` of a subscription_updated (a
// subscription object, like subscription_created), the subscription item's
// subscription of a subscription_plan_changed (as processed there).
function planChangeSubscriptionId(eventName, payload) {
	const id =
		eventName === 'subscription_updated'
			? payload?.data?.id
			: payload?.data?.attributes?.first_subscription_item?.subscription_id
	return id == null ? undefined : String(id)
}

// Processes the event with the transaction client `tx`; returns the processed
// event it duplicates (then skipped), or null.
async function processInTransaction(tx, webhook) {
	const id = webhook.id
	// process the webhook
	const parsed_webhook = JSON.parse(webhook.body)

	// Deliveries of one crediting event wait for each other here (the lock is
	// released at commit or rollback), so the duplicate check below and the
	// grant cannot interleave: two deliveries at the same time credit once.
	const key = idempotencyKey(webhook.eventName, parsed_webhook)
	if (key) {
		await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`
	}

	const duplicateOf = await findProcessedDuplicate(tx, webhook, parsed_webhook)
	if (duplicateOf) {
		await tx.webhookEvent.update({
			data: {
				processingError: `Duplicate of webhook event ${duplicateOf.id}, already processed: skipped`,
				processed: true,
			},
			where: { id: id },
		})
		return duplicateOf
	}

	let note = null
	// switch
	switch (webhook.eventName) {
		case 'order_created':
			await processOrderCreated(tx, parsed_webhook)
			break
		case 'subscription_cancelled':
			await processSubscriptionCancelled(tx, parsed_webhook)
			break
		case 'subscription_created':
			await processSubscriptionCreated(tx, parsed_webhook)
			break
		case 'subscription_payment_success':
			await processSubscriptionPaymentSuccess(tx, parsed_webhook)
			break
		case 'subscription_plan_changed':
			await processSubscriptionPlanChanged(tx, parsed_webhook)
			break
		case 'subscription_resumed':
			await processSubscriptionResumed(tx, parsed_webhook)
			break
		case 'subscription_updated':
			note = await processSubscriptionUpdated(tx, parsed_webhook, webhook)
			break
	}

	// the webhook is processed, update the webhook (a plan change applied by
	// subscription_updated keeps a note, see hasProcessedPlanChange)
	await tx.webhookEvent.update({
		data: note ? { processingError: note, processed: true } : { processed: true },
		where: { id: id },
	})
	return null
}

// private function to process the webhook "order_created": credits a paid
// order, i.e. a one-time credit pack OR the first payment of a new
// subscription (Lemon Squeezy always sends order_created with
// subscription_created). The first subscription payment also triggers
// subscription_payment_success (billing_reason "initial"), which is skipped
// there so it is credited only once, here.
async function processOrderCreated(tx, parsed_webhook) {
	const userId = parsed_webhook.meta.custom_data.user_id // Clerk user ID
	const customerId = toIntOrNull(parsed_webhook.data.attributes.customer_id) // Lemon Squeezy customer ID

	// check if the user already exists
	let user = await tx.user.findUnique({
		where: {
			clerkId: userId,
		},
	})

	if (!user) {
		// create a new user in the database if they don't exist
		user = await tx.user.create({
			data: {
				customerId: customerId,
				clerkId: userId,
			},
		})
	} else if (!user.customerId) {
		// update the user's customerId if it's not already set
		await tx.user.update({
			data: { customerId: customerId },
			where: { clerkId: userId },
		})
	}

	// check if the order is paid
	if (parsed_webhook.data.attributes.status === 'paid') {
		// get the variant_id from the first_order_item
		const variantId = parsed_webhook.data.attributes.first_order_item.variant_id.toString()

		// get the plan associated with the variantId
		const plan = await tx.plan.findUnique({
			where: {
				variantId: variantId,
			},
		})

		if (!plan) {
			throw new Error(`Plan not found for variant ${variantId}, sync the plans (/api/sync) and reprocess`)
		}

		// add the credits to the user
		await updateCredits(user.clerkId, plan.packageSize ?? 0, null, 'Order created', tx)
	}
}

// private function to process the webhook "subscription_cancelled", to update the status of the subscription
async function processSubscriptionCancelled(tx, webhook) {
	await tx.subscription.update({
		data: {
			endsAt: webhook.data.attributes.ends_at,
			statusFormatted: 'Cancelled',
			status: 'cancelled',
		},
		where: {
			lemonSqueezyId: webhook.data.attributes.first_subscription_item.subscription_id.toString(),
		},
	})
}

async function processSubscriptionCreated(tx, webhook) {
	// A redelivery (lost answer, Resend): the subscription is already created.
	// Creating it again would fail on its unique Lemon Squeezy id.
	const existing = await tx.subscription.findUnique({
		where: { lemonSqueezyId: String(webhook.data.id) },
	})
	if (existing) {
		logger.info(`subscription ${webhook.data.id}: already created, skipped`)
		return
	}

	// Get the user based on the Clerk user ID
	const user = await tx.user.findUnique({
		where: {
			clerkId: webhook.meta.custom_data.user_id,
		},
	})

	if (user) {
		// Update the user's customerId if it's not already set
		if (!user.customerId) {
			await tx.user.update({
				data: {
					// User.customerId is an Int column
					customerId: toIntOrNull(webhook.data.attributes.customer_id),
				},
				where: { clerkId: webhook.meta.custom_data.user_id },
			})
		}
	} else {
		console.error('User not found for userId:', webhook.meta.custom_data.user_id)
	}

	// link plan with variantId
	const variantId = webhook.data.attributes.variant_id.toString()
	const plan = await tx.plan.findUnique({
		where: {
			variantId: variantId,
		},
	})

	if (!plan) {
		throw new Error(`Plan not found for variant ${variantId}, sync the plans (/api/sync) and reprocess`)
	}

	// create a new subscription in the database for the user
	await tx.subscription.create({
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
//   only (never negative). Fails while the plan change (subscription_updated
//   or subscription_plan_changed) is not processed yet (no `oldPlanId`, or
//   a stale one, see hasProcessedPlanChange): Lemon Squeezy retries the
//   invoice, by then usually after its plan change, or it can be resent.
// - "renewal" (and any other reason): a new period, the full current plan
// The plan change marker (`oldPlanId`, set by a plan change) is cleared once
// an invoice is credited, so it is used at most once.
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Preserve the existing branch order and behavior during the tooling migration.
async function processSubscriptionPaymentSuccess(tx, webhook) {
	// Extract the Clerk user ID and Lemon Squeezy subscription ID from the webhook data
	const userId = webhook.meta.custom_data.user_id
	const subscriptionId = webhook.data.attributes.subscription_id
	const billingReason = webhook.data.attributes.billing_reason

	// The initial payment of a subscription is credited by order_created (sent
	// with every purchase, it carries the variant and does not depend on
	// subscription_created having been processed first).
	if (billingReason === 'initial') {
		logger.info(`subscription ${subscriptionId}: initial payment already credited by order_created`)
		return
	}

	// Find the user in the database based on the Clerk user ID
	const user = await tx.user.findUnique({
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
		throw new Error(`CustomerId not set for user ${user.clerkId}, invoice not credited`)
	}

	// The subscription this invoice pays, with its current plan
	const subscription = await tx.subscription.findUnique({
		where: {
			lemonSqueezyId: String(subscriptionId),
		},
		include: {
			plan: true,
		},
	})

	if (!subscription) {
		throw new Error(`Subscription ${subscriptionId} not found, process its subscription_created event and reprocess`)
	}

	const packageSize = subscription.plan?.packageSize ?? 0

	if (billingReason === 'updated') {
		// Lemon Squeezy does not order its webhooks: without the plan change
		// marker the extra credits are unknown. Fail so this invoice is
		// retried (or resent) once its plan change is processed (crediting 0
		// would mark it processed and a resend would be skipped as a duplicate).
		if (
			!(
				subscription.oldPlanId &&
				(await hasProcessedPlanChange(tx, subscription, userId, webhook.data.attributes.created_at))
			)
		) {
			throw new Error(
				`Subscription ${subscriptionId}: plan change not processed yet, resend this invoice after its plan change (subscription_updated or subscription_plan_changed) event`
			)
		}
		const oldPlan = await tx.plan.findUnique({
			where: { id: subscription.oldPlanId },
		})
		const extraCredits = oldPlan ? Math.max(0, packageSize - (oldPlan.packageSize ?? 0)) : 0

		if (extraCredits > 0) {
			await updateCredits(user.clerkId, extraCredits, null, 'Subscription payment success (plan change)', tx)
		} else {
			logger.info(`subscription ${subscriptionId}: plan change invoice, no extra credits`)
		}
	} else {
		await updateCredits(user.clerkId, packageSize, null, 'Subscription payment success', tx)
	}

	if (subscription.oldPlanId) {
		await tx.subscription.update({
			where: {
				lemonSqueezyId: String(subscriptionId),
			},
			data: { oldPlanId: null },
		})
	}
}

// private function to process the webhook "subscription_plan_changed", to update the plan of the subscription
async function processSubscriptionPlanChanged(tx, webhook) {
	// Get the subscription ID from the webhook data
	const subscriptionId = webhook.data.attributes.first_subscription_item?.subscription_id

	if (!subscriptionId) {
		console.error('Subscription ID not found in the webhook data')
		return
	}

	// Get the user's current subscription
	const subscription = await tx.subscription.findFirst({
		where: {
			lemonSqueezyId: subscriptionId.toString(),
		},
		include: {
			plan: true,
		},
	})

	if (!subscription) {
		throw new Error(`Subscription ${subscriptionId} not found, process its subscription_created event and reprocess`)
	}

	// Get the new plan associated with the variantId
	const variantId = webhook.data.attributes.variant_id.toString()
	const newPlan = await tx.plan.findUnique({
		where: {
			variantId: variantId,
		},
	})

	if (!newPlan) {
		throw new Error(`Plan not found for variant ${variantId}, sync the plans (/api/sync) and reprocess`)
	}

	// Already on this plan: a redelivery of this event. Overwriting the old
	// plan with the current one would lose the extra credits of the upgrade.
	if (subscription.planId === newPlan.id) {
		logger.info(`subscription ${subscriptionId}: already on plan ${newPlan.id}, plan change skipped`)
		return
	}

	// Update the subscription with the new plan and the old plan
	await tx.subscription.update({
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
async function processSubscriptionResumed(tx, webhook) {
	await tx.subscription.update({
		data: {
			endsAt: webhook.data.attributes.ends_at,
			statusFormatted: 'Active',
			status: 'active',
			isPaused: false,
		},
		where: {
			lemonSqueezyId: webhook.data.attributes.first_subscription_item.subscription_id.toString(),
		},
	})
}

// private function to process the webhook "subscription_updated", sent for
// every change of a subscription (status, renewal date, payment method,
// plan...). Lemon Squeezy does not send subscription_plan_changed (none in
// production): a `variant_id` other than the subscription's plan is a plan
// change, applied like subscription_plan_changed does (`oldPlanId` keeps the
// previous plan for the `updated` invoice, which then credits max(0, new -
// old)). The status is left to the status events. Both events can arrive for
// one change: the second one finds the subscription already on the new plan
// and changes nothing. Returns the note stored on the event when the plan
// changed, null otherwise.
async function processSubscriptionUpdated(tx, webhook, event) {
	const variantId = webhook.data?.attributes?.variant_id
	const subscriptionId = planChangeSubscriptionId('subscription_updated', webhook)
	if (variantId == null || subscriptionId == null) {
		return null
	}

	const subscription = await tx.subscription.findUnique({
		where: { lemonSqueezyId: subscriptionId },
		include: { plan: true },
	})

	if (!subscription) {
		throw new Error(`Subscription ${subscriptionId} not found, process its subscription_created event and reprocess`)
	}

	// same plan: a routine update (renewal, status, payment method...)
	if (subscription.plan?.variantId === String(variantId)) {
		return null
	}

	const newPlan = await tx.plan.findUnique({
		where: { variantId: String(variantId) },
	})

	if (!newPlan) {
		throw new Error(`Plan not found for variant ${variantId}, sync the plans (/api/sync) and reprocess`)
	}

	if (await hasNewerProcessedUpdate(tx, event, webhook, subscriptionId)) {
		logger.info(
			`subscription ${subscriptionId}: older than a processed update, plan change to variant ${variantId} skipped`
		)
		return null
	}

	await tx.subscription.update({
		data: { oldPlanId: subscription.planId, planId: newPlan.id },
		where: { lemonSqueezyId: subscriptionId },
	})

	logger.info(`subscription ${subscriptionId}: plan ${subscription.planId} -> ${newPlan.id}`)
	return `${PLAN_CHANGE_NOTE}: plan ${subscription.planId} -> plan ${newPlan.id}`
}

async function recordProcessingError(id, error) {
	try {
		await prisma.webhookEvent.update({
			data: { processingError: String(error.message ?? error) },
			where: { id: id },
		})
	} catch (updateError) {
		console.error(`webhook ${id}: processing error not recorded:`, updateError.code ?? updateError.name)
	}
}

// Lemon Squeezy ids are integers; Int columns must not receive strings.
function toIntOrNull(value) {
	const number = Number(value)
	return value == null || !Number.isInteger(number) ? null : number
}
