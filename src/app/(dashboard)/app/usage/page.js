'use client'

import React from 'react'

import { UsageChartComponent } from '@/components/usage/usageChart.component'

export const metadata = {
	title: 'Usage Statistics - ForVoyez',
	description:
		'Monitor your ForVoyez API usage, track monthly limits, and analyze your image metadata generation trends.',
	alternates: {
		canonical: '/app/usage',
	},
}

export default function PlansPage() {
	return (
		<>
			<h1 className="my-6 text-center text-2xl font-bold">API Usage</h1>

			<UsageChartComponent />
		</>
	)
}
