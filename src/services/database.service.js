'use server'
import { getProduct, getVariant } from '@lemonsqueezy/lemonsqueezy.js'

import {
	initLemonSqueezy,
	listPrice,
	listProducts,
	listVariants,
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
		return { y: u.used, x: u.usedAt }
	})
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
