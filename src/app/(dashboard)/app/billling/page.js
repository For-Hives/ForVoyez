'use client'
import { useEffect } from 'react'

export default function BillingPage() {
	useEffect(() => {
		lemonSqueezySetup()
	}, [])

	return (
		<div>
			<h1>Billing</h1>
		</div>
	)
}
