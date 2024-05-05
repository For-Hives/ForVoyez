'use server'
import {
	listProducts,
	listVariants,
	listPrice,
	initLemonSqueezy,
} from '@/services/lemonsqueezy.service'
import { prisma } from '@/services/prisma.service'
import { getProduct } from '@lemonsqueezy/lemonsqueezy.js'

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
		console.log(`Syncing variant ${variant.name} with the database...`)

		// Sync the variant with the plan in the database.
		await prisma.plan.upsert({
			where: { variantId: variant.variantId },
			update: variant,
			create: variant,
		})

		/* eslint-disable no-console -- allow */
		console.log(`${variant.name} synced with the database...`)

		productVariants.push(variant)
	}

	// Fetch products from the Lemon Squeezy store.
	const products = await listProducts()

	console.log('get products')

	// Loop through all the variants.
	const allVariants = await listVariants()

	console.log('get all variants', allVariants)

	// for...of supports asynchronous operations, unlike forEach.
	if (allVariants) {
		console.log('into all variants')

		for (const v of allVariants) {
			// Fetch the variant attributes.

			const variant = v.attributes

			console.log('get variant precisions')

			// Skip draft variants or if there's more than one variant, skip the default
			// variant. See https://docs.lemonsqueezy.com/api/variants
			if (
				variant.status === 'draft' ||
				(allVariants.length !== 1 && variant.status === 'pending')
			) {
				// `return` exits the function entirely, not just the current iteration.
				continue
			}

			console.log('not draft or pending')

			// Fetch the Product name.
			const productName =
				(await getProduct(variant.product_id)).data?.data.attributes.name ?? ''

			console.log('get product name')

			// Fetch the Price object.
			const variantPriceObject = await listPrice(v.id)

			console.log('get variant price object', variantPriceObject)

			const currentPriceObj = variantPriceObject.at(0)

			console.log('get current price object', currentPriceObj)

			const isUsageBased =
				currentPriceObj?.attributes.usage_aggregation !== null

			console.log('is usage based')
			const interval = currentPriceObj?.attributes.renewal_interval_unit

			console.log('get interval')

			const intervalCount =
				currentPriceObj?.attributes.renewal_interval_quantity

			console.log('get interval count')

			const trialInterval = currentPriceObj?.attributes.trial_interval_unit

			console.log('get trial interval')

			const trialIntervalCount =
				currentPriceObj?.attributes.trial_interval_quantity

			console.log('get trial interval count')

			const price = isUsageBased
				? currentPriceObj?.attributes.unit_price_decimal
				: currentPriceObj.attributes.unit_price

			console.log('get price')

			const priceString = price !== null ? price?.toString() ?? '' : ''

			console.log('get price string')

			const isSubscription =
				currentPriceObj?.attributes.category === 'subscription'

			console.log('is subscription')

			// If not a subscription, skip it.
			if (!isSubscription) {
				continue
			}

			console.log('not subscription')

			// model Plan {
			// 	id             Int      @id @default(autoincrement())
			// 	productId      String
			// 	variantId      String   @unique
			// 	variantEnabled Boolean  @default(true)
			// 	name           String
			// 	description    String?
			// 		price          Int // Prix de base en centimes pour une unité
			// 	billingCycle   String // "monthly" or "annually"
			// 	packageSize    Int? // Nombre d'unités incluses dans le package
			// 		createdAt      DateTime @default(now())
			// 	mostPopular    Boolean  @default(false)
			// 	features       String   @default("")
			// 	buttonText     String   @default("Subscribe")
			//
			// 	subscriptions Subscription[]
			// }

			await _addVariant({
				productId: variant.product_id.toString(),
				variantId: v.id,
				variantEnabled: true,
				name: variant.name,
				description: variant.description,
				price: parseInt(priceString),
				billingCycle: interval,
				packageSize: variant.package_size,
			})

			// OLD CODE
			// await _addVariant({
			// 	productId: variant.product_id.toString(),
			// 	variantId: v.id,
			// 	variantEnabled: true,
			// 	name: variant.name,
			// 	description: variant.description,
			// 	price: parseInt(priceString),
			// 	credits: 0,
			// 	billingCycle: interval,
			// 	category: currentPriceObj.attributes.category,
			// 	pricingScheme: currentPriceObj.attributes.scheme,
			// 	setupFeeEnabled: variant.setup_fee_enabled,
			// 	setupFee: variant.setup_fee,
			// 	packageSize: variant.package_size,
			// 	tiers: variant.tiers,
			// 	renewalIntervalUnit: interval,
			// 	renewalIntervalCount: intervalCount,
			// 	trialIntervalUnit: trialInterval,
			// 	trialIntervalCount: trialIntervalCount,
			// })
		}
	}

	return productVariants
}
