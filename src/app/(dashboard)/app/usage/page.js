'use client'

import React from 'react'

import { UsageChartComponent } from '@/components/usage/usageChart.component'

export default function PlansPage() {
	return (
		<>
			<h1 className="my-6 text-center text-2xl font-bold">API Usage</h1>

			<UsageChartComponent />
		</>
	)
}
