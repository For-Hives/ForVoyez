'use client'

import { ChangingPlansComponent } from '@/components/Dashboard/ChangingPlans.component'
import { RefillPlansComponent } from '@/components/Dashboard/RefillPlans.component'

export default function ClientLogicPlans() {
	return (
		<div className="prose mx-auto max-w-5xl flex-auto">
			<h1 className="text-xl font-bold text-slate-800">Available Plans</h1>
			<p className="mt-1 text-sm text-slate-600">
				This is where you can view and change your current subscription plan.
				Choose the plan that best suits your needs and scale as your usage
				grows. You can upgrade, downgrade, or cancel your plan at any time.
			</p>
			<ChangingPlansComponent />
			{/*<RefillPlansComponent />*/}
		</div>
	)
}
