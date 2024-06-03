'use server'
import { currentUser } from '@clerk/nextjs/server'

import {
	getVariant,
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

	return plans
}

/**
 * Syncs product variants from Lemon Squeezy with the Plan model in the database.
 * Only syncs variants of type 'subscription'.
 */
export async function syncPlans() {
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
	const userPrisma = await prisma.user.findUnique({
		select: { customerId: true },
		where: { clerkId: user.id },
	})
	if (!user) {
		throw new Error('User not authenticated')
	}
	if (!userPrisma?.customerId) {
		let subscriptionClient = await prisma.subscription.findFirst({
			where: { userId: user.id },
		})
		if (!subscriptionClient?.customerId) {
			return null
		}
		await prisma.user.update({
			data: { customerId: Number(subscriptionClient.customerId) },
			where: { clerkId: subscriptionClient.userId },
		})
		return subscriptionClient.customerId
	}

	return userPrisma?.customerId ?? null
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

	console.log('User:', user)

	// Get user credits from the database
	let userCredits = await getCreditsFromUserId()
	console.log('User credits:', userCredits)

	// Fetch all usage data for the user, ordered by date
	const usageData = await prisma.usage.findMany({
		where: { userId: user.id },
		orderBy: { usedAt: 'asc' },
	})

	console.log('Usage data:', usageData)

	if (usageData.length === 0) {
		console.log('No usage data found for the user')
		return []
	}

	let hourlyCreditsLeft = {}

	console.log('Initial user credits:', userCredits)

	// Group usage data by hour and calculate the remaining credits for each hour
	usageData.forEach(usage => {
		const dateHour = usage.usedAt.toISOString().slice(0, 13) // Format: YYYY-MM-DDTHH
		console.log('Processing usage for date hour:', dateHour)

		if (!hourlyCreditsLeft[dateHour]) {
			console.log('Creating new entry for date hour:', dateHour)
			hourlyCreditsLeft[dateHour] = {
				creditsLeft: userCredits,
				fullDate: usage.usedAt,
				dateHour,
			}
		}

		console.log('Usage credits:', usage.used)
		userCredits += usage.used
		console.log('Updated user credits:', userCredits)

		hourlyCreditsLeft[dateHour].creditsLeft = userCredits
		console.log(
			'Updated credits left for date hour:',
			dateHour,
			hourlyCreditsLeft[dateHour].creditsLeft
		)
	})

	const hourlyUsageArray = Object.values(hourlyCreditsLeft)
	console.log('Hourly usage array:', hourlyUsageArray)

	// If there are less than 5 usage records, return all of them for better chart display
	if (hourlyUsageArray.length <= 5) {
		console.log('Returning hourly usage array as is')
		return hourlyUsageArray
	}

	console.log('Returning hourly usage array')
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

// fixme broken export
// export const TestingExports = {
// 	getCurrentUser,
// }
