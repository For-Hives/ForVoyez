'use client'

import { ChangingPlansComponent } from '@/components/Dashboard/ChangingPlans.component'

export default function PlansPage() {
	return (
		<>
			<h1 className="my-6 text-center text-2xl font-bold">Available Plans</h1>

			<ChangingPlansComponent />
		</>
	)
}
