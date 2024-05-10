import { useEffect } from 'react'

export default function BillingPage() {
	useEffect(() => {
		console.log('Billing Page')
		lemonSqueezySetup()
	}, [])

	return (
		<div>
			<h1>Billing</h1>
		</div>
	)
}
