'use client'

import { useEffect, useState } from 'react'
import { getPlans } from '@/services/database.service' // Ajuste le chemin selon ton architecture
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCheckoutURL } from '@/services/lemonsqueezy.service'

export default function PlansPage() {
	const router = useRouter()

	const [plans, setPlans] = useState([])

	useEffect(() => {
		getPlans().then(setPlans)
	}, [])

	console.table(plans)

	async function subscribe(variantId) {
		try {
			// syncPlans().then(r => console.log(r))
			const url = await getCheckoutURL(variantId)
			await router.push(url)
		} catch (e) {
			console.log(e)
		}
	}

	return (
		<>
			<h1 className="my-6 text-center text-2xl font-bold">Available Plans</h1>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{plans.map((plan, index) => (
					<div
						key={index}
						className="max-w-sm overflow-hidden rounded p-4 shadow-lg"
					>
						<Image
							alt="Plan Image" // Assure-toi que les plans ont des images ou ajuste cette partie
							src="/path/to/your/image.jpg"
							width={250}
							height={250}
							className="w-full"
						/>
						<div className="px-6 py-4">
							<div className="mb-2 text-xl font-bold">{plan.name}</div>
							<p className="text-base text-slate-700">
								{plan.description || 'No description available.'}
							</p>
						</div>
						<div className="px-6 pb-2 pt-4">
							<span className="mb-2 mr-2 inline-block rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
								Price: €{plan.price / 100}/month
							</span>
							<button
								onClick={() => subscribe(plan.id)}
								className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
							>
								Subscribe
							</button>
						</div>
					</div>
				))}
			</div>
		</>
	)
}
