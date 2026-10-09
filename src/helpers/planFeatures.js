// What the subscription plan cards promise, derived from the plans loaded from
// the database (prices and credits that /api/sync reads from Lemon Squeezy).
// Every plan runs the same code (same AI model, images resized server side,
// same playground): the plans only differ by their credits. The legacy
// Plan.features column is hand-written, never synced, and not used here.

const BILLING_CYCLES = ['month', 'year']

// what every plan gets, listed on the cheapest plan of each billing cycle
export const COMMON_PLAN_FEATURES = [
	'Title, alternative text and caption for each image',
	'JPEG, PNG, WebP and non-animated GIF, up to 10 MB',
	'Generate directly from your WordPress media library',
	'Email support',
]

export const ENTERPRISE_FEATURES = ['Custom credit volume', 'Volume discounts']

// "Up to 14.7% cheaper", "15% cheaper": one decimal at most
export function formatSaving(percent) {
	return `${percent.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`
}

// Percent saved by paying the yearly plan instead of 12 months of the monthly
// plan of the same name (works from either of them), one decimal, rounded
// half away from zero: 14.7 for 19.95€/year against 1.95€/month. Null when
// the yearly plan does not give exactly 12 times the monthly credits (the
// prices would not buy the same thing) or is not cheaper.
export function getAnnualSaving(tier, plans) {
	if (!isSubscriptionTier(tier)) return null

	const yearly = tier.billingCycle === 'year' ? tier : namesake(tier, plans, 'year')
	const monthly = tier.billingCycle === 'month' ? tier : namesake(tier, plans, 'month')
	if (!(yearly && monthly)) return null

	if (!isPositiveInteger(monthly.packageSize)) return null
	if (yearly.packageSize !== 12 * monthly.packageSize) return null
	if (!(monthly.price > 0 && Number.isFinite(yearly.price))) return null

	const monthlyPricePerYear = 12 * monthly.price
	// in tenths of a percent; Math.round rounds half away from zero for the
	// positive savings, the only ones shown
	const tenths = Math.round((1000 * (monthlyPricePerYear - yearly.price)) / monthlyPricePerYear)
	return tenths > 0 ? tenths / 10 : null
}

// Enterprise includes the most expensive monthly plan (Growth)
export function getEnterpriseFeatures(plans) {
	const monthlyTiers = subscriptionTiers(plans, 'month')
	const tiers = monthlyTiers.length > 0 ? monthlyTiers : subscriptionTiers(plans)
	const topTier = tiers.reduce((top, tier) => (!top || tier.price > top.price ? tier : top), null)

	if (!topTier) return [...ENTERPRISE_FEATURES]
	return [`All ${topTier.name} plan features`, ...ENTERPRISE_FEATURES]
}

// The best saving among the yearly plans, null when none is cheaper
export function getMaxAnnualSaving(plans) {
	return subscriptionTiers(plans, 'year').reduce((max, tier) => {
		const saving = getAnnualSaving(tier, plans)
		return saving !== null && (max === null || saving > max) ? saving : max
	}, null)
}

// The cheapest plan of a billing cycle lists what every plan gets, the other
// plans of that cycle include it: "All Starter plan features".
export function getPlanFeatures(tier, plans) {
	if (!isSubscriptionTier(tier)) return []

	const credits = formatCredits(tier)
	const creditLines = credits ? [credits] : []
	const baseTier = cheapestTier(plans, tier.billingCycle) ?? tier

	if (isSameTier(tier, baseTier)) {
		return [...creditLines, ...COMMON_PLAN_FEATURES]
	}
	return [`All ${baseTier.name} plan features`, ...creditLines]
}

function cheapestTier(plans, billingCycle) {
	return subscriptionTiers(plans, billingCycle).reduce(
		(cheapest, tier) => (!cheapest || tier.price < cheapest.price ? tier : cheapest),
		null
	)
}

// "250 credits*/month", "3,000 credits*/year": the credits given on each
// payment (the yearly plans are credited once a year)
function formatCredits(tier) {
	if (!isPositiveInteger(tier.packageSize)) return null
	const unit = tier.packageSize === 1 ? 'credit' : 'credits'
	return `${tier.packageSize.toLocaleString('en-US')} ${unit}*/${tier.billingCycle}`
}

function isPositiveInteger(value) {
	return Number.isInteger(value) && value > 0
}

function isSameTier(a, b) {
	return a === b || (a.variantId != null && a.variantId === b.variantId)
}

function isSubscriptionTier(plan) {
	return BILLING_CYCLES.includes(plan?.billingCycle)
}

// the only plan of that billing cycle with the same name, null if none or
// several (the saving would be ambiguous)
function namesake(tier, plans, billingCycle) {
	const matches = subscriptionTiers(plans, billingCycle).filter(plan => plan.name === tier.name)
	return matches.length === 1 ? matches[0] : null
}

// refills have no billing cycle (null, or '' in older rows)
function subscriptionTiers(plans, billingCycle = null) {
	return (plans ?? []).filter(
		plan => isSubscriptionTier(plan) && (billingCycle === null || plan.billingCycle === billingCycle)
	)
}
