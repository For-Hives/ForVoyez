// Lemon Squeezy webhook payloads shaped like the real ones, for the tests of
// the purchase events (analyticsPurchaseEvents*.test.js). Everything that
// identifies the customer or the sale has a value found nowhere else, so a
// test can check that none of it ever leaves the server.

export const CLERK_USER_ID = 'user_2zQfClerkJane'
const CUSTOMER_ID = 9100042
const ORDER_ID = 9200043
const SUBSCRIPTION_ID = 9300044
const INVOICE_ID = 9400045
const PRICE = 91919

const CUSTOMER = { user_email: 'jane.doe@example.com', user_name: 'Jane Doe' }

// Plan rows, as /api/sync stores them
export const PACK = plan(3, '9500046', '250 credits', null, 250)
export const STARTER = plan(7, '9500047', 'Starter', 'month', 100)
export const GROWTH = plan(8, '9500048', 'Growth', 'month', 500)
export const GROWTH_YEARLY = plan(9, '9500049', 'Growth', 'year', 6000)
export const PLANS = [PACK, STARTER, GROWTH, GROWTH_YEARLY]

// Who bought, and the ids and the amount of the sale: never in what
// processWebhook reports, never sent to Umami
export const CUSTOMER_DATA = [
	CLERK_USER_ID,
	'jane',
	'Doe',
	'example.com',
	String(CUSTOMER_ID),
	String(ORDER_ID),
	String(SUBSCRIPTION_ID),
	String(INVOICE_ID),
	String(PRICE),
	'4242',
	'lemonsqueezy',
	'Monthly plan with',
]

// Umami gets none of the above, and no Lemon Squeezy catalog id either
export const NEVER_SENT = [...CUSTOMER_DATA, ...PLANS.map(row => row.variantId), '9600001', '9700001', '9800001']

function plan(id, variantId, name, billingCycle, packageSize) {
	return {
		description: `Monthly plan with ${packageSize} credits`,
		productName: `ForVoyez ${name}`,
		productId: '9600001',
		variantEnabled: true,
		price: PRICE,
		billingCycle,
		packageSize,
		variantId,
		name,
		id,
	}
}

function event(eventName, type, id, attributes) {
	return {
		data: {
			attributes: { store_id: 9700001, customer_id: CUSTOMER_ID, ...CUSTOMER, ...attributes },
			id: String(id),
			type,
		},
		meta: { custom_data: { user_id: CLERK_USER_ID }, event_name: eventName, test_mode: false },
	}
}

export function orderCreated(plan, { status = 'paid', id = ORDER_ID } = {}) {
	return event('order_created', 'orders', id, {
		first_order_item: {
			variant_id: Number(plan.variantId),
			product_name: plan.productName,
			variant_name: plan.name,
			order_id: id,
			price: PRICE,
		},
		urls: { receipt: 'https://app.lemonsqueezy.com/my-orders/9200043/receipt' },
		total_formatted: '$919.19',
		currency: 'USD',
		total: PRICE,
		status,
	})
}

// a Lemon Squeezy subscription object: the body of every subscription_* event
// but subscription_payment_success
export function subscriptionEvent(
	eventName,
	plan,
	{ status = 'active', updatedAt = '2026-10-13T10:00:00.000000Z', id = SUBSCRIPTION_ID } = {}
) {
	return event(eventName, 'subscriptions', id, {
		urls: { customer_portal: 'https://forvoyez.lemonsqueezy.com/billing?signature=abc' },
		first_subscription_item: { subscription_id: id, price_id: 9800001, quantity: 1 },
		status_formatted: status.replace('_', ' '),
		renews_at: '2026-11-13T10:00:00.000000Z',
		variant_id: Number(plan.variantId),
		product_name: plan.productName,
		variant_name: plan.name,
		card_last_four: '4242',
		updated_at: updatedAt,
		trial_ends_at: null,
		order_id: ORDER_ID,
		ends_at: null,
		status,
	})
}

// a Lemon Squeezy subscription invoice
export function invoicePaid(
	billingReason,
	{ createdAt = '2026-10-13T10:00:04.000000Z', subscriptionId = SUBSCRIPTION_ID, id = INVOICE_ID } = {}
) {
	return event('subscription_payment_success', 'subscription-invoices', id, {
		urls: { invoice_url: 'https://app.lemonsqueezy.com/my-orders/9200043/subscription-invoice/9400045' },
		billing_reason: billingReason,
		subscription_id: subscriptionId,
		total_formatted: '$919.19',
		card_last_four: '4242',
		created_at: createdAt,
		currency: 'USD',
		status: 'paid',
		total: PRICE,
	})
}

// The Subscription row a processed subscription_created leaves
export function subscriptionRow(plan, { status = 'active', oldPlanId = null } = {}) {
	return {
		lemonSqueezyId: String(SUBSCRIPTION_ID),
		customerId: String(CUSTOMER_ID),
		email: CUSTOMER.user_email,
		name: CUSTOMER.user_name,
		userId: CLERK_USER_ID,
		orderId: ORDER_ID,
		planId: plan.id,
		oldPlanId,
		status,
	}
}

export function userRow() {
	return { clerkId: CLERK_USER_ID, customerId: CUSTOMER_ID, credits: 0 }
}
