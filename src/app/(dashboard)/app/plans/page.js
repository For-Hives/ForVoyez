'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ChangingPlansComponent } from '@/components/Dashboard/ChangingPlans.component'
import { PricingComponent } from '@/components/Landing/Pricing/Pricing.component'
import { getPlans } from '@/services/database.service' // Ajuste le chemin selon ton architecture
import { getCheckoutURL } from '@/services/lemonsqueezy.service'

export default function PlansPage() {
	const router = useRouter()

	const [plans, setPlans] = useState([])
	const [isMonthly, setIsMonthly] = useState(true)

	useEffect(() => {
		getPlans().then(setPlans)
	}, [])

	return (
		<>
			<h1 className="my-6 text-center text-2xl font-bold">Available Plans</h1>

			<ChangingPlansComponent />
		</>
	)
}
