'use client'

import React, { useEffect, useState } from 'react'
import { getPlans } from '@/services/database.service' // Ajuste le chemin selon ton architecture
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCheckoutURL } from '@/services/lemonsqueezy.service'
import { PricingComponent } from '@/components/Landing/Pricing/Pricing.component'
import { ChangingPlansComponent } from '@/components/dashboard/ChangingPlans.component'
import { UsageChartComponent } from '@/components/usage/usageChart.component'

export default function PlansPage() {
	return (
		<>
			<h1 className="my-6 text-center text-2xl font-bold">API Usage</h1>

			<UsageChartComponent />
		</>
	)
}
