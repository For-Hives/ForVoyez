'use client'

import { useEffect, useState } from 'react'
import { getPlans } from '@/services/database.service' // Ajuste le chemin selon ton architecture
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCheckoutURL } from '@/services/lemonsqueezy.service'
import { PricingComponent } from '@/components/LandingComponents/Pricing/Pricing.component'
import { ChangingPlansComponent } from '@/components/dashboard/ChangingPlans.component'

export default function PlansPage() {
	const router = useRouter()

	const [plans, setPlans] = useState([])
	const [isMonthly, setIsMonthly] = useState(true)

	useEffect(() => {
		getPlans().then(setPlans)
	}, [])

	console.table(plans)

	return (
		<>
			<h1 className="my-6 text-center text-2xl font-bold">Available Plans</h1>

			<ChangingPlansComponent />
		</>
	)
}
