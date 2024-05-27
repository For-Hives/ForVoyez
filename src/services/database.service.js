'use server'
import { getVariant } from '@lemonsqueezy/lemonsqueezy.js'
import { currentUser } from '@clerk/nextjs/server'

import {
	initLemonSqueezy,
	listPrice,
	listProducts,
} from '@/services/lemonsqueezy.service'
import { prisma } from '@/services/prisma.service'

/**
 * Retrieves the authenticated user.
 */
async function getCurrentUser() {
	const user = await currentUser()
	if (!user) {
		throw new Error('User not authenticated')
	}
	return user
}

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
				productName: product.attributes.name,
				variantId: variant.id,
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
			description: variant.description,
			productName: variant.productName,
			variantId: variant.variantId,
			price: parseInt(priceString),
			variantEnabled: true,
			name: variant.name,
			billingCycle: null,
			packageSize,
		})
	}

	return refillVariants
}

/**
 * Retrieves the customer ID for the authenticated user.
 * Returns null if the user has no subscription.
 * Throws an error if the user is not authenticated.
 */
export async function getCustomerIdFromUser() {
	const user = await currentUser()
	if (!user) {
		throw new Error('User not authenticated')
	}

	const sub = await prisma.subscription.findFirst({
		where: { userId: user.id },
	})

	return sub?.customerId ?? null
}

/**
 * Updates the credits for the specified user.
 * Creates an entry in the Usage table to track usage.
 */
export async function updateCredits(userId, credits, tokenId, reason) {
	if (typeof credits !== 'number' || isNaN(credits)) {
		throw new Error('Invalid credits value')
	}

	await prisma.user.update({
		data: { credits: { increment: credits } },
		where: { clerkId: userId },
	})

	await prisma.usage.create({
		data: {
			userId: userId,
			used: credits,
			tokenId,
			reason,
		},
	})
}

/**
 * Decrements the credits for the authenticated user.
 * and log the usage
 */
export async function decrementCredit(reason, tokenId = null) {
	const user = await getCurrentUser()
	await updateCredits(user.id, -1, tokenId, reason)
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
			fullDate: usage.usedAt,
			dateHour,
		}
		userCredits = hourlyCreditsLeft[dateHour].creditsLeft
	})

	const hourlyUsageArray = Object.values(hourlyCreditsLeft)

	// If there are less than 5 usage records, return all of them for better chart display
	if (hourlyUsageArray.length <= 5) {
		return usageData.map(u => ({
			dateHour: u.usedAt.toISOString().slice(0, 13),
			creditsLeft: u.used,
			fullDate: u.usedAt,
		}))
	}

	return hourlyUsageArray
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
 * Retrieves the authenticated user's subscription.
 * Includes the plan associated with the subscription.
 * Throws an error if the user is not authenticated.
 */
export async function getSubscriptionFromUserId() {
	const user = await currentUser()
	if (!user) {
		throw new Error('User not authenticated')
	}

	return prisma.subscription.findFirst({
		where: { userId: user.id },
		include: { plan: true },
	})
}

/**
 * Retrieves the authenticated user's credits.
 * Throws an error if the user is not authenticated.
 * Returns the user's credits.
 */
export async function getCreditsFromUserId() {
	const user = await currentUser()

	if (!user) {
		throw new Error('User not authenticated')
	}

	const connectedUser = await prisma.user.findFirst({
		where: { clerkId: user.id },
	})

	return connectedUser.credits
}
