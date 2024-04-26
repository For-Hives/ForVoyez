'use server'
import {
	listPrice,
	listProducts,
	listVariants,
} from '@/services/lemonsqueezy.service'
import { prisma } from '@/services/prisma.service'

//
// Modèle Plan
//
// Plus clair, et évite les problèmes potentiels de gestion des erreurs et de performance liés à l'utilisation de `map` pour des opérations asynchrones.
//

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

					let plan = {
						productId: product.id,
						productName: product.attributes.name,
						variantId: variant.id,
						name: variant.attributes.name,
						description: variant.attributes.description,
						price: price.attributes.unit_price,
						unit: price.attributes.unit,
						isUsageBased: false,
						interval: price.attributes.interval,
						intervalCount: price.attributes.interval_count,
						trialInterval: price.attributes.trial_interval,
						trialIntervalCount: price.attributes.trial_interval_count,
						sort: 0,
					}

					try {
						const createdPlan = await prisma.plan.create({ data: plan })
						console.log('Plan créé :', createdPlan)
					} catch (e) {
						console.error('Erreur lors de la création du plan :', e)
					}
				}
			}
		}
	} catch (e) {
		console.error('Erreur dans la synchronisation des plans :', e)
	}
}
