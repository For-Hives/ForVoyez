'use server'
import { getVariant } from '@lemonsqueezy/lemonsqueezy.js'

import {
	initLemonSqueezy,
	listPrice,
	listProducts,
} from '@/services/lemonsqueezy.service'
import { prisma } from '@/services/prisma.service'

export async function getPlans(filter = null) {
	const plans = await prisma.plan.findMany()

	// filter can be "yearly" or "monthly", and it deletes the other one time paid plans (refills)
	if (filter) {
		return plans.filter(plan => plan.billingCycle === filter)
	}

	await syncPlans()

	return plans
}

/**
 * This action will sync the product variants from Lemon Squeezy with the
 * Plans database model. It will only sync the 'subscription' variants.
 */
export async function syncPlans() {
	await initLemonSqueezy()

	// Helper function to add a variant to the productVariants array and sync it with the database.
	async function _addVariant(variant) {
		if (!variant.variantId) {
			console.error('Variant ID is undefined for variant:', variant)
			return
		}
		// Sync the variant with the plan in the database.
		await prisma.plan.upsert({
			where: { variantId: variant.variantId },
			update: {
				...variant,
			},
			create: {
				...variant,
			},
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

	for (const variant of refillVariants) {
		const variantPriceObject = await listPrice(variant.variantId)
		const currentPriceObj = variantPriceObject.at(0)

		const isUsageBased = currentPriceObj?.attributes.usage_aggregation !== null

		const packageSize = currentPriceObj?.attributes.package_size

		const price = isUsageBased
			? currentPriceObj?.attributes.unit_price_decimal
			: currentPriceObj.attributes.unit_price

		const priceString = price !== null ? price?.toString() ?? '' : ''

		await _addVariant({
			productId: variant.product_id.toString(),
			variantId: variant.variantId,
			variantEnabled: true,
			name: variant.name,
			description: variant.description,
			price: parseInt(priceString),
			billingCycle: null,
			packageSize: packageSize,
			productName: variant.productName,
		})
	}

	return refillVariants
}

export async function getCustomerIdFromUser(userId) {
	// obtain it through table user.subscription[0].customerId

	// check if user has a subscription
	const sub = await prisma.subscription.findFirst({
		where: {
			userId: userId,
		},
	})

	if (sub) {
		return sub.customerId
	}

	return null
}

export async function updateCreditForUser(userId, credits, tokenId = null) {
	const user = await prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
	})

	// Ensure the user exists
	if (!user) {
		console.error('User not found:', userId)
		return
	}

	// update the user credits and customer id
	await prisma.user.update({
		where: {
			clerkId: userId,
		},
		data: {
			credits: user.credits + credits,
		},
	})

	// log the usage

	await prisma.usage.create({
		data: {
			userId: userId,
			used: user.credits + credits,
			tokenId,
		},
	})
}

export async function getUsageForUser(userId) {
	// Fetch all usage data for the user
	const usageData = await prisma.usage.findMany({
		where: { userId },
		orderBy: { usedAt: 'asc' },
	})

	if (usageData.length === 0) {
		return []
	}

	// Get initial credits for the user
	const user = await prisma.user.findUnique({
		where: { clerkId: userId },
	})

	let userCredits = user.credits
	let hourlyCreditsLeft = {}

	// Group usage data by hour and get the last value for each unique hour
	usageData.forEach(usage => {
		const dateHour = usage.usedAt.toISOString().slice(0, 13) // Format: YYYY-MM-DDTHH
		hourlyCreditsLeft[dateHour] = {
			creditsLeft: usage.used,
			dateHour,
			fullDate: usage.usedAt, // Full date and time
		}
		userCredits = hourlyCreditsLeft[dateHour].creditsLeft
	})

	const hourlyUsageArray = Object.values(hourlyCreditsLeft)

	// If there are less than 5 usage records, return all of them for better chart display
	if (hourlyUsageArray.length <= 5) {
		const user = await prisma.user.findUnique({
			where: {
				clerkId: userId,
			},
			include: {
				Usage: true,
			},
		})

		let us = await user.Usage

		return us.map(u => {
			return {
				creditsLeft: u.used,
				fullDate: u.usedAt,
				dateHour: u.usedAt.toISOString().slice(0, 13),
			}
		})
	}

	return hourlyUsageArray
}

export async function getUsageStats(userId) {
	const usageData = await prisma.usage.findMany({
		where: { userId },
		orderBy: { usedAt: 'asc' },
	})

	const dailyUsage = usageData.reduce((acc, usage) => {
		const date = usage.usedAt.toISOString().split('T')[0]
		if (!acc[date]) {
			acc[date] = { date, used: 0, creditsLeft: 0 }
		}
		acc[date].used += usage.used
		acc[date].creditsLeft = usage.user.credits - acc[date].used // assuming user.credits is the starting credit
		return acc
	}, {})

	const dailyUsageArray = Object.values(dailyUsage)

	return dailyUsageArray
}

export async function getUserFromUserId(userId) {
	return prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
	})
}

export async function getUsageByToken(userId) {
	const user = await prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
		include: {
			Usage: {
				include: {
					token: true,
				},
			},
		},
	})

	const usageByToken = user.Usage.reduce((acc, usage) => {
		const tokenName = usage.token ? usage.token.name : 'Playground'
		if (!acc[tokenName]) {
			acc[tokenName] = 0
		}
		acc[tokenName] += 1
		return acc
	}, {})

	return Object.entries(usageByToken).map(([token, used]) => ({
		token,
		used,
	}))
}

export async function getSubscriptionFromUserId(userId) {
	// check if user has a subscription
	return prisma.subscription.findFirst({
		where: {
			userId: userId,
		},
		include: {
			plan: true,
		},
	})
}
