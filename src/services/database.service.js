'use server'
import {
	listProducts,
	listVariants,
	listPrice,
} from '@/services/lemonsqueezy.service'
import { prisma } from '@/services/prisma.service'

export async function syncPlans() {
	console.log('Synchronisation des plans')

	try {
		const products = await listProducts()
		console.log('Liste des produits obtenue')

		for (const product of products) {
			console.log('Traitement du produit :', product.id)
			const variants = await listVariants(product.id)
			console.log('Variantes du produit obtenues')

			for (const variant of variants) {
				console.log('Traitement de la variante :', variant.id)
				const prices = await listPrice(variant.id)
				console.log('Prix de la variante obtenus')

				for (const price of prices) {
					console.log('Traitement du prix :', price)
					let planData = {
						productId: product.id,
						variantId: variant.id,
						name: variant.attributes.name,
						description: variant.attributes.description,
						price: price.attributes.unit_price,
						credits: price.attributes.package_size || 0,
						billingCycle: price.attributes.renewal_interval_unit || 'NA',
						category: price.attributes.category,
						pricingScheme: price.attributes.scheme,
						setupFeeEnabled: price.attributes.setup_fee_enabled || false,
						setupFee: price.attributes.setup_fee,
						packageSize: price.attributes.package_size,
						tiers: JSON.stringify(price.attributes.tiers),
						renewalIntervalUnit: price.attributes.renewal_interval_unit,
						renewalIntervalCount: price.attributes.renewal_interval_quantity,
						trialIntervalUnit: price.attributes.trial_interval_unit,
						trialIntervalCount: price.attributes.trial_interval_quantity,
					}

					try {
						const createdPlan = await prisma.plan.upsert({
							where: { variantId: variant.id },
							update: planData,
							create: planData,
						})
						console.log('Plan créé ou mis à jour :', createdPlan)
					} catch (e) {
						console.error(
							'Erreur lors de la création ou de la mise à jour du plan :',
							e
						)
					}
				}
			}
		}
	} catch (e) {
		console.error('Erreur dans la synchronisation des plans :', e)
	}
}

export async function getPlans() {
	return prisma.plan.findMany()
}
