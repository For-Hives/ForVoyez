'use server'
import { currentUser } from '@clerk/nextjs/server'
import { getVariant } from '@lemonsqueezy/lemonsqueezy.js'

import {
	initLemonSqueezy,
	listPrice,
	listProducts,
} from '@/services/lemonsqueezy.service'
import { prisma } from '@/services/prisma.service'

/**
 * Retrieves plans from the database.
 * If a filter is specified, only returns plans matching the filter.
 * Otherwise, syncs plans with Lemon Squeezy before returning them.
 */
export async function getPlans(filter = null) {
	const plans = await prisma.plan.findMany()

	if (filter) {
		return plans.filter(plan => plan.billingCycle === filter)
	}

	await syncPlans()

	return plans
}

/**
 * Syncs product variants from Lemon Squeezy with the Plan model in the database.
 * Only syncs variants of type 'subscription'.
 */
export async function syncPlans() {
	await initLemonSqueezy()

	async function _addVariant(variant) {
		if (!variant.variantId) {
			console.error('Variant ID is undefined for variant:', variant)
			return
		}
		await prisma.plan.upsert({
			where: { variantId: variant.variantId },
			update: variant,
			create: variant,
		})
	}

	const allProducts = await listProducts()
	let allVariants = []

	// Loop through all products and get their variants
	for (const product of allProducts) {
		const productVariants = product.relationships.variants.data
		for (const variant of productVariants) {
			const variantDetails = await getVariant(variant.id)
			allVariants.push({
				...variantDetails.data.data.attributes,
				variantId: variant.id,
				productName: product.attributes.name,
			})
		}
	}

	// Filter out subscription variants
	const refillVariants = allVariants.filter(
		v => !v.is_subscription && v.name !== 'Default'
	)

	// Add refill variants to the database
	for (const variant of refillVariants) {
		const variantPriceObject = await listPrice(variant.variantId)
		const currentPriceObj = variantPriceObject.at(0)

		const isUsageBased = currentPriceObj?.attributes.usage_aggregation !== null
		const packageSize = currentPriceObj?.attributes.package_size
		const price = isUsageBased
			? currentPriceObj?.attributes.unit_price_decimal
			: currentPriceObj.attributes.unit_price
		const priceString = price?.toString() ?? ''

		await _addVariant({
			productId: variant.product_id.toString(),
			variantId: variant.variantId,
			variantEnabled: true,
			name: variant.name,
			description: variant.description,
			price: parseInt(priceString),
			billingCycle: null,
			packageSize,
			productName: variant.productName,
		})
	}

	return refillVariants
}

/**
 * Retrieves the customer ID from the user ID.
 * Returns null if the user has no subscription.
 */
export async function getCustomerIdFromUser(userId) {
	const sub = await prisma.subscription.findFirst({
		where: { userId },
	})

	return sub?.customerId ?? null
}

// fixme check
/**
 * Updates the credits for the authenticated user.
 * Creates an entry in the Usage table to track usage.
 * Throws an error if the user is not authenticated.
 */
export async function updateCreditForUser(credits, tokenId = null) {
	const user = await currentUser()
	if (!user) {
		throw new Error('User not authenticated')
	}

	// Update user credits using Prisma's increment
	await prisma.user.update({
		where: { clerkId: user.id },
		data: { credits: { increment: credits } },
	})

	// Log the usage
	await prisma.usage.create({
		data: {
			userId: user.id,
			used: credits,
			tokenId,
		},
	})
}

/**
 * Retrieves API usage for the authenticated user.
 * Returns usage data grouped by hour.
 * If less than 5 records, returns all usage data.
 * Throws an error if the user is not authenticated.
 */
export async function getUsageForUser() {
	const user = await currentUser()
	if (!user) {
		throw new Error('User not authenticated')
	}

	// Fetch all usage data for the user, ordered by date
	const usageData = await prisma.usage.findMany({
		where: { userId: user.id },
		orderBy: { usedAt: 'asc' },
	})

	if (usageData.length === 0) {
		return []
	}

	let userCredits = user.credits
	let hourlyCreditsLeft = {}

	// Group usage data by hour and get the last value for each unique hour
	usageData.forEach(usage => {
		const dateHour = usage.usedAt.toISOString().slice(0, 13) // Format: YYYY-MM-DDTHH
		hourlyCreditsLeft[dateHour] = {
			creditsLeft: usage.used,
			dateHour,
			fullDate: usage.usedAt,
		}
		userCredits = hourlyCreditsLeft[dateHour].creditsLeft
	})

	const hourlyUsageArray = Object.values(hourlyCreditsLeft)

	// If there are less than 5 usage records, return all of them for better chart display
	if (hourlyUsageArray.length <= 5) {
		return usageData.map(u => ({
			creditsLeft: u.used,
			fullDate: u.usedAt,
			dateHour: u.usedAt.toISOString().slice(0, 13),
		}))
	}

	return hourlyUsageArray
}

/**
 * Retrieves daily usage statistics for the authenticated user.
 * Returns an array of objects containing the date, used credits, and remaining credits for each day.
 * Throws an error if the user is not authenticated.
 */
export async function getUsageStats() {
	const user = await currentUser()
	if (!user) {
		throw new Error('User not authenticated')
	}

	// Fetch usage data for the user, including the user object
	const usageData = await prisma.usage.findMany({
		where: { userId: user.id },
		orderBy: { usedAt: 'asc' },
		include: { user: true },
	})

	// Reduce the usage data into a daily summary
	const dailyUsage = usageData.reduce((acc, usage) => {
		const date = usage.usedAt.toISOString().split('T')[0]
		if (!acc[date]) {
			acc[date] = { date, used: 0, creditsLeft: 0 }
		}
		acc[date].used += usage.used
		acc[date].creditsLeft = usage.user.credits - acc[date].used
		return acc
	}, {})

	return Object.values(dailyUsage)
}

/**
 * Retrieves API usage by token for the authenticated user.
 * Returns an array of objects containing the token name and the number of uses.
 * Throws an error if the user is not authenticated.
 */
export async function getUsageByToken() {
	const user = await currentUser()
	if (!user) {
		throw new Error('User not authenticated')
	}

	// Fetch usage data for the user, including the associated token
	const usageData = await prisma.usage.findMany({
		where: { userId: user.id },
		include: { token: true },
	})

	// Count the number of uses for each token
	const usageByToken = usageData.reduce((acc, usage) => {
		const tokenName = usage.token?.name ?? 'Playground'
		acc[tokenName] = (acc[tokenName] ?? 0) + 1
		return acc
	}, {})

	// Convert the object to an array of { token, used } pairs
	return Object.entries(usageByToken).map(([token, used]) => ({ token, used }))
}

/**
 * Retrieves a user's subscription from their ID.
 * Includes the plan associated with the subscription.
 */
export async function getSubscriptionFromUserId(userId) {
	return prisma.subscription.findFirst({
		where: { userId },
		include: { plan: true },
	})
}
