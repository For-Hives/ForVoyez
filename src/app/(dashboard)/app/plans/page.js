'use client'

import { ChangingPlansComponent } from '@/components/Dashboard/ChangingPlans.component'

export default function PlansPage() {
	return (
		<div className="prose mx-auto max-w-5xl flex-auto">
			<h1 className="text-xl font-bold text-slate-800">Available Plans</h1>
			<p className="text-slate-600"></p>
			<ChangingPlansComponent />
		</div>
	)
}
