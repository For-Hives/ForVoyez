// Server-only data access. This module is NOT a server action module (no
// 'use server'): client components go through the dedicated, auth-checked
// actions in `src/app/actions/app/` instead of importing it.
import { currentUser } from '@clerk/nextjs/server'

import {
	getVariant,
	listPrice,
	listProducts,
} from '@/services/lemonsqueezy.service'
import { prisma } from '@/services/prisma.service'

import 'server-only'

export class NoCreditsLeftError extends Error {
	constructor() {
		super('No credits left')
		this.name = 'NoCreditsLeftError'
	}
}

/**
 * Charges one credit to `userId` for the result of `work`.
 *
 * The credit is reserved atomically before `work` runs (a single
 * `UPDATE ... WHERE credits >= 1`), so parallel requests can never spend the
 * same credit twice nor push the balance below zero. If `work` throws, the
 * credit is refunded and the error is rethrown. The `Usage` row is only
 * written once `work` succeeded.
 *
 * @param {string} userId - Clerk user id (User.clerkId)
 * @param {{ reason: string, tokenId?: string | null }} usage - Usage row fields
 * @param {() => Promise<T>} work - the paid operation
 * @returns {Promise<T>} the result of `work`
 * @throws {NoCreditsLeftError} when the user has no credit left
 * @template T
 */
export async function chargeOneCredit(
	userId,
	{ tokenId = null, reason },
	work
) {
	const [reservation, userAfterReservation] = await prisma.$transaction([
		prisma.user.updateMany({
			where: { credits: { gte: 1 }, clerkId: userId },
			data: { credits: { decrement: 1 } },
		}),
		prisma.user.findUnique({
			where: { clerkId: userId },
			select: { credits: true },
		}),
	])

	if (reservation.count === 0) {
		throw new NoCreditsLeftError()
	}

	let result
	try {
		result = await work()
	} catch (error) {
		await refundOneCredit(userId)
		throw error
	}

	// Same transaction as the decrement: the row was locked, so this is exactly
	// the balance right after this request's reservation.
	const currentCredits = userAfterReservation.credits
	try {
		await prisma.usage.create({
			data: {
				previousCredits: currentCredits + 1,
				currentCredits,
				userId: userId,
				used: -1,
				tokenId,
				reason,
			},
		})
	} catch (error) {
		// The work succeeded and the credit is spent: do not fail the request
		// because the usage log could not be written.
		console.error(`Failed to record usage for user ${userId}:`, error.message)
	}

	console.info(`User ${userId} used 1 credit`)
	return result
}

// Function to find the API token behind a verified JWT. Returns the Token row
// only if it still exists (not deleted from the dashboard), belongs to
// `userId` and has not expired; null otherwise.
export async function findActiveApiToken(jwt, userId) {
	if (!jwt || !userId) {
		return null
	}

	const token = await prisma.token.findUnique({
		where: { jwt },
	})

	if (!token || token.userId !== userId) {
		return null
	}

	if (!(new Date(token.expiredAt) > new Date())) {
		return null
	}

	return token
}

// Function to retrieve the authenticated user's credits
export async function getCreditsFromUserId() {
	const user = await getCurrentUser()

	const connectedUser = await prisma.user.findFirst({
		where: { clerkId: user.id },
	})

	return connectedUser?.credits
}

// Function to retrieve the authenticated user
export async function getCurrentUser() {
	const user = await currentUser()
	if (!user) {
		throw new Error('User not authenticated')
	}
	return user
}

// Function to retrieve the customer ID for the authenticated user
export async function getCustomerIdFromUser() {
	const user = await getCurrentUser()
	const userPrisma = await prisma.user.findUnique({
		select: { customerId: true },
		where: { clerkId: user.id },
	})

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

// Function to retrieve plans from the database
export async function getPlans(filter = null) {
	const plans = await prisma.plan.findMany()
	if (filter) {
		return plans.filter(plan => plan.billingCycle === filter)
	}
	return plans
}

// Function to retrieve the authenticated user's subscription
export async function getSubscriptionFromUserId() {
	const user = await getCurrentUser()

	return prisma.subscription.findFirst({
		where: { userId: user.id },
		include: { plan: true },
	})
}

// Function to retrieve API usage by token for the authenticated user
export async function getUsageByToken() {
	const user = await getCurrentUser()

	const usageData = await prisma.usage.findMany({
		where: { userId: user.id },
		include: { token: true },
	})

	const usageByToken = usageData.reduce((acc, usage) => {
		const tokenName = usage.token?.name ?? 'Playground'
		acc[tokenName] = (acc[tokenName] ?? 0) + 1
		return acc
	}, {})

	return Object.entries(usageByToken).map(([token, used]) => ({ token, used }))
}

// Function to retrieve API usage for the authenticated user
export async function getUsageForUser() {
	const user = await getCurrentUser()

	const userCredits = await getCreditsFromUserId()
	if (!userCredits) {
		throw new Error('User credits not found')
	}

	const usageData = await prisma.usage.findMany({
		where: { userId: user.id },
		orderBy: { usedAt: 'asc' },
	})

	if (usageData.length === 0) {
		return []
	}

	let hourlyCreditsLeft = {}

	usageData.forEach(usage => {
		const dateHour = usage.usedAt.toISOString().slice(0, 13)

		if (!hourlyCreditsLeft[dateHour]) {
			hourlyCreditsLeft[dateHour] = {
				creditsLeft: usage.previousCredits,
				fullDate: usage.usedAt,
				dateHour,
			}
		} else {
			hourlyCreditsLeft[dateHour].creditsLeft = usage.previousCredits
		}
	})

	const hourlyUsageArray = Object.values(hourlyCreditsLeft)

	if (hourlyUsageArray.length <= 5) {
		return hourlyUsageArray
	}
	return hourlyUsageArray
}

// Function to sync product variants with the Plan model in the database
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

	try {
		const allProducts = await listProducts()
		let allVariants = []

		for (const product of allProducts) {
			if (!product?.relationships?.variants?.data) {
				continue
			}

			const productVariants = product.relationships.variants.data
			for (const variant of productVariants) {
				const variantDetails = await getVariant(variant.id)
				if (!variantDetails?.data?.attributes) {
					continue
				}

				allVariants.push({
					...variantDetails.data.attributes,
					productName: product.attributes.name,
					variantId: variant.id,
				})
			}
		}

		const refillVariants = allVariants.filter(
			v => !v.is_subscription && v.name !== 'Default'
		)

		const baseVariants = allVariants.filter(
			v => v.is_subscription && v.name !== 'Default'
		)

		for (const variant of refillVariants) {
			const variantPriceObject = await listPrice(variant.variantId)
			const currentPriceObj = variantPriceObject?.[0]

			if (!currentPriceObj || !currentPriceObj.attributes) {
				console.error('Price object is missing attributes:', currentPriceObj)
				continue
			}

			const isUsageBased = currentPriceObj.attributes.usage_aggregation !== null
			const interval = variant.is_subscription
				? currentPriceObj?.attributes.renewal_interval_unit
				: null
			const packageSize = currentPriceObj.attributes.package_size
			const price = isUsageBased
				? currentPriceObj.attributes.unit_price_decimal
				: currentPriceObj.attributes.unit_price
			const priceString = price?.toString() ?? ''

			await _addVariant({
				productId: variant.product_id.toString(),
				description: variant.description,
				productName: variant.productName,
				variantId: variant.variantId,
				price: parseInt(priceString),
				billingCycle: interval,
				variantEnabled: true,
				name: variant.name,
				packageSize,
			})
		}
		console.info('refills variants are synced')

		for (const variant of baseVariants) {
			const variantPriceObject = await listPrice(variant.variantId)
			const currentPriceObj = variantPriceObject?.[0]

			if (!currentPriceObj || !currentPriceObj.attributes) {
				console.error('Price object is missing attributes:', currentPriceObj)
				continue
			}

			const isUsageBased = currentPriceObj.attributes.usage_aggregation !== null
			const interval = variant.is_subscription
				? currentPriceObj?.attributes.renewal_interval_unit
				: null
			const packageSize = currentPriceObj.attributes.package_size
			const price = isUsageBased
				? currentPriceObj.attributes.unit_price_decimal
				: currentPriceObj.attributes.unit_price
			const priceString = price?.toString() ?? ''

			await _addVariant({
				productId: variant.product_id.toString(),
				description: variant.description,
				productName: variant.productName,
				variantId: variant.variantId,
				price: parseInt(priceString),
				name: variant.productName,
				billingCycle: interval,
				variantEnabled: true,
				packageSize,
			})
		}
		console.info('base variants are synced')

		return refillVariants
	} catch (error) {
		console.error('Error syncing plans:', error)
		throw error
	}
}

// Function to add (or remove, when negative) credits for the specified user.
// The balance change is a single atomic `credits = credits + n` update.
export async function updateCredits(userId, credits, tokenJwt, reason) {
	if (typeof credits !== 'number' || isNaN(credits)) {
		throw new Error('Invalid credits value')
	}

	const user = await prisma.user.findUnique({
		where: { clerkId: userId },
		select: { clerkId: true },
	})

	if (!user) {
		throw new Error('User not found')
	}

	const updatedUser = await prisma.user.update({
		data: { credits: { increment: credits } },
		where: { clerkId: userId },
		select: { credits: true },
	})

	const currentCredits = updatedUser.credits
	const previousCredits = currentCredits - credits

	let token = null
	if (tokenJwt) {
		token = await prisma.token.findFirst({
			where: { jwt: tokenJwt },
		})
	}

	await prisma.usage.create({
		data: {
			previousCredits: previousCredits,
			currentCredits: currentCredits,
			tokenId: token?.id,
			userId: userId,
			used: credits,
			reason,
		},
	})
}

async function refundOneCredit(userId) {
	try {
		await prisma.user.update({
			data: { credits: { increment: 1 } },
			where: { clerkId: userId },
		})
	} catch (error) {
		console.error(`Failed to refund 1 credit to user ${userId}:`, error.message)
	}
}
