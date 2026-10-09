// Server-only data access. This module is NOT a server action module (no
// 'use server'): client components go through the dedicated, auth-checked
// actions in `src/app/actions/app/` instead of importing it.
import { auth } from '@clerk/nextjs/server'
import { forEachInSequence } from '@/helpers/forEachInSequence'
import { getVariant, listPrice, listProducts } from '@/services/lemonsqueezy.service'
import { logger } from '@/services/logger.service'
import { prisma } from '@/services/prisma.service'

import 'server-only'

// Preserve parseInt's existing hexadecimal detection when making the radix explicit.
const HEX_PRICE = /^\s*[+-]?0x/i

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
export async function chargeOneCredit(userId, { tokenId = null, reason }, work) {
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

	logger.info(`User ${userId} used 1 credit`)
	return result
}

// Function to find the API token behind a verified JWT. Returns the Token row
// only if it still exists (not deleted from the dashboard), belongs to
// `userId` and has not expired; null otherwise.
export async function findActiveApiToken(jwt, userId) {
	if (!(typeof jwt === 'string' && jwt.length > 0 && typeof userId === 'string' && userId.length > 0)) {
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

// Function to retrieve the authenticated user's credits. No User row yet (the
// layout creates it on the very first visit) means no credits: 0, not undefined.
export async function getCreditsFromUserId() {
	const user = await getCurrentUser()

	const connectedUser = await prisma.user.findFirst({
		where: { clerkId: user.id },
	})

	return connectedUser?.credits ?? 0
}

/**
 * Returns the authenticated user as `{ id }` (the Clerk user id) only.
 *
 * Every caller only needs the id: `auth()` reads it from the session the Clerk
 * proxy already verified, while `currentUser()` would call the rate-limited
 * Clerk Backend API on every dashboard request.
 *
 * @returns {Promise<{ id: string }>}
 * @throws {Error} when the request is anonymous
 */
export async function getCurrentUser() {
	const { userId } = await auth()
	if (!userId) {
		throw new Error('User not authenticated')
	}
	return { id: userId }
}

// Function to retrieve the customer ID for the authenticated user
export async function getCustomerIdFromUser() {
	const user = await getCurrentUser()
	const userPrisma = await prisma.user.findUnique({
		select: { customerId: true },
		where: { clerkId: user.id },
	})

	if (!userPrisma?.customerId) {
		const subscriptionClient = await prisma.subscription.findFirst({
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

	// only the charged operations (used: -1): purchases and renewals add credits
	// without a token and are not "Playground" uses
	const usageData = await prisma.usage.findMany({
		where: { userId: user.id, used: { lt: 0 } },
		include: { token: true },
	})

	const usageByToken = usageData.reduce((acc, usage) => {
		const tokenName = usage.token?.name ?? 'Playground'
		acc[tokenName] = (acc[tokenName] ?? 0) + 1
		return acc
	}, Object.create(null))

	return Object.entries(usageByToken).map(([token, used]) => ({ token, used }))
}

// Function to retrieve the authenticated user's balance over time: one point
// per hour, the balance right after the last operation of that hour. It does
// not depend on the current balance, so a user at 0 credits keeps their history.
export async function getUsageForUser() {
	const user = await getCurrentUser()

	const usageData = await prisma.usage.findMany({
		where: { userId: user.id },
		orderBy: { usedAt: 'asc' },
	})

	const hourlyCreditsLeft = {}

	for (const usage of usageData) {
		const dateHour = usage.usedAt.toISOString().slice(0, 13)

		// rows are sorted, so the last one of the hour wins. currentCredits is
		// the balance after the operation (previousCredits the one before it).
		// Two overlapping API calls can end in the reverse order of their
		// balances (usedAt is set once the work is done), so the last point may
		// lag behind the real balance, which the page shows next to the chart.
		hourlyCreditsLeft[dateHour] = {
			creditsLeft: usage.currentCredits,
			fullDate: usage.usedAt,
			dateHour,
		}
	}

	return Object.values(hourlyCreditsLeft)
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
		const allVariants = []

		await forEachInSequence(allProducts, async product => {
			if (!product?.relationships?.variants?.data) {
				return
			}

			const productVariants = product.relationships.variants.data
			await forEachInSequence(productVariants, async variant => {
				const variantDetails = await getVariant(variant.id)
				if (!variantDetails?.data?.attributes) {
					return
				}

				allVariants.push({
					...variantDetails.data.attributes,
					productName: product.attributes.name,
					variantId: variant.id,
				})
			})
		})

		const refillVariants = allVariants.filter(v => !v.is_subscription && v.name !== 'Default')

		const baseVariants = allVariants.filter(v => v.is_subscription && v.name !== 'Default')

		await forEachInSequence(refillVariants, async variant => {
			const variantPriceObject = await listPrice(variant.variantId)
			const currentPriceObj = variantPriceObject?.[0]

			if (!currentPriceObj?.attributes) {
				console.error('Price object is missing attributes:', currentPriceObj)
				return
			}

			const isUsageBased = currentPriceObj.attributes.usage_aggregation !== null
			const interval = variant.is_subscription ? currentPriceObj?.attributes.renewal_interval_unit : null
			const packageSize = currentPriceObj.attributes.package_size
			const price = isUsageBased ? currentPriceObj.attributes.unit_price_decimal : currentPriceObj.attributes.unit_price
			const priceString = price?.toString() ?? ''

			await _addVariant({
				productId: variant.product_id.toString(),
				description: variant.description,
				productName: variant.productName,
				variantId: variant.variantId,
				price: parseInt(priceString, HEX_PRICE.test(priceString) ? 16 : 10),
				billingCycle: interval,
				variantEnabled: true,
				name: variant.name,
				packageSize,
			})
		})
		logger.info('refills variants are synced')

		await forEachInSequence(baseVariants, async variant => {
			const variantPriceObject = await listPrice(variant.variantId)
			const currentPriceObj = variantPriceObject?.[0]

			if (!currentPriceObj?.attributes) {
				console.error('Price object is missing attributes:', currentPriceObj)
				return
			}

			const isUsageBased = currentPriceObj.attributes.usage_aggregation !== null
			const interval = variant.is_subscription ? currentPriceObj?.attributes.renewal_interval_unit : null
			const packageSize = currentPriceObj.attributes.package_size
			const price = isUsageBased ? currentPriceObj.attributes.unit_price_decimal : currentPriceObj.attributes.unit_price
			const priceString = price?.toString() ?? ''

			await _addVariant({
				productId: variant.product_id.toString(),
				description: variant.description,
				productName: variant.productName,
				variantId: variant.variantId,
				price: parseInt(priceString, HEX_PRICE.test(priceString) ? 16 : 10),
				name: variant.productName,
				billingCycle: interval,
				variantEnabled: true,
				packageSize,
			})
		})
		logger.info('base variants are synced')

		return refillVariants
	} catch (error) {
		console.error('Error syncing plans:', error)
		throw error
	}
}

// Function to add (or remove, when negative) credits for the specified user.
// The balance change is a single atomic `credits = credits + n` update. Pass
// a transaction client as `db` to commit the credits and their Usage row
// together with other writes (see processWebhook).
export async function updateCredits(userId, credits, tokenJwt, reason, db = prisma) {
	if (!Number.isSafeInteger(credits)) {
		throw new Error('Invalid credits value')
	}

	const user = await db.user.findUnique({
		where: { clerkId: userId },
		select: { clerkId: true },
	})

	if (!user) {
		throw new Error('User not found')
	}

	const updatedUser = await db.user.update({
		data: { credits: { increment: credits } },
		where: { clerkId: userId },
		select: { credits: true },
	})

	const currentCredits = updatedUser.credits
	const previousCredits = currentCredits - credits

	let token = null
	if (tokenJwt) {
		token = await db.token.findFirst({
			where: { jwt: tokenJwt },
		})
	}

	await db.usage.create({
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
