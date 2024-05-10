'use server'
import { getProduct } from '@lemonsqueezy/lemonsqueezy.js'

import {
	initLemonSqueezy,
	listPrice,
	listProducts,
	listVariants,
} from '@/services/lemonsqueezy.service'
import { prisma } from '@/services/prisma.service'

export async function getPlans(filter = null) {
	const plans = await prisma.plan.findMany()

	// filter can be "yearly" or "monthly"
	if (filter) {
		return plans.filter(plan => plan.billingCycle === filter)
	}

	syncPlans()

	return plans
}

/**
 * This action will sync the product variants from Lemon Squeezy with the
 * Plans database model. It will only sync the 'subscription' variants.
 */
export async function syncPlans() {
	await initLemonSqueezy()

	// Fetch all the variants from the database.
	const productVariants = await prisma.plan.findMany()

	// Helper function to add a variant to the productVariants array and sync it with the database.
	async function _addVariant(variant) {
		// eslint-disable-next-line no-console -- allow

		// Sync the variant with the plan in the database.
		await prisma.plan.upsert({
			where: { variantId: variant.variantId },
			update: variant,
			create: variant,
		})

		/* eslint-disable no-console -- allow */

		productVariants.push(variant)
	}

	// Fetch products from the Lemon Squeezy store.
	const products = await listProducts()

	// Loop through all the variants.
	const allVariants = await listVariants()

	// for...of supports asynchronous operations, unlike forEach.
	if (allVariants) {
		for (const v of allVariants) {
			// Fetch the variant attributes.

			const variant = v.attributes

			// Skip draft variants or if there's more than one variant, skip the default
			// variant. See https://docs.lemonsqueezy.com/api/variants
			if (
				variant.status === 'draft' ||
				(allVariants.length !== 1 && variant.status === 'pending')
			) {
				// `return` exits the function entirely, not just the current iteration.
				continue
			}

			const product = (await getProduct(variant.product_id)).data?.data

			// Fetch the Product name.
			const productName = product.attributes.name ?? ''
			const productDescription = product.attributes.description ?? ''

			// Fetch the Price object.
			const variantPriceObject = await listPrice(v.id)

			const currentPriceObj = variantPriceObject.at(0)

			const isUsageBased =
				currentPriceObj?.attributes.usage_aggregation !== null

			const interval = currentPriceObj?.attributes.renewal_interval_unit

			const intervalCount =
				currentPriceObj?.attributes.renewal_interval_quantity

			const trialInterval = currentPriceObj?.attributes.trial_interval_unit

			const trialIntervalCount =
				currentPriceObj?.attributes.trial_interval_quantity

			const price = isUsageBased
				? currentPriceObj?.attributes.unit_price_decimal
				: currentPriceObj.attributes.unit_price

			const priceString = price !== null ? price?.toString() ?? '' : ''

			const isSubscription =
				currentPriceObj?.attributes.category === 'subscription'

			// If not a subscription, skip it.
			if (!isSubscription) {
				continue
			}

			await _addVariant({
				productId: variant.product_id.toString(),
				variantId: v.id,
				variantEnabled: true,
				name: productName,
				description: productDescription,
				price: parseInt(priceString),
				billingCycle: interval,
				packageSize: variant.package_size,
			})
		}
	}

	return productVariants
}

export async function getCustomerIdFromUser(userId) {
	// obtain it throught table user.subscription[0].customerId

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
	console.log('updating credits', userId, credits)

	const user = await prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
	})

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
	console.log('logging usage')

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
	console.log('test', us)

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
	})
}
