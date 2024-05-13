'use client'

import { ChangingPlansComponent } from '@/components/Dashboard/ChangingPlans.component'

export const metadata = {
	title: 'Pricing Plans - ForVoyez',
	description:
		"Explore ForVoyez's flexible pricing plans designed to suit your image metadata generation needs and scale with your business.",
	alternates: {
		canonical: '/app/plans',
	},
}

export default function PlansPage() {
	return (
		<div className="prose mx-auto max-w-5xl flex-auto">
			<h1 className="text-xl font-bold text-slate-800">Available Plans</h1>
			<p className="mt-1 text-sm text-slate-600">
				This is where you can view and change your current subscription plan.
				Choose the plan that best suits your needs and scale as your usage
				grows. You can upgrade, downgrade, or cancel your plan at any time.
			</p>
			<ChangingPlansComponent />
		</div>
	)
}
