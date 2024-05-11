'use client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import {
	getCustomerPortalLink,
	hasEverBeenSubscribed,
} from '@/services/lemonsqueezy.service'

export default function BillingPage() {
	const [loadingMessage, setLoadingMessage] = useState('Loading your data...')
	const [routerReady, setRouterReady] = useState(false)
	const router = useRouter()

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setRouterReady(true) // Set router ready when window is available
		}
	}, [])

	useEffect(() => {
		if (!routerReady) return

		async function handleUserRedirect() {
			setLoadingMessage('Checking your subscription status...')

			try {
				// Check if the user has ever been subscribed
				const hasSubscription = await hasEverBeenSubscribed()
				if (!hasSubscription) {
					// If the user has never been subscribed, redirect and show a toast message
					toast.info(
						'You must have been subscribed at least once to access this page.'
					)
					router.push('/plans')
					return
				}

				// If the user has been subscribed in the past, fetch the customer portal link
				setLoadingMessage('Fetching your billing portal...')
				const url = await getCustomerPortalLink()
				console.log('Customer portal link:', url)
				// Uncomment to actually perform the redirection
				// window.location.href = url;
				setLoadingMessage('Redirecting to your billing portal...')
			} catch (error) {
				// Handle errors (e.g., network issues, permissions)
				toast.error('Failed to load data: ' + error.message)
				setLoadingMessage('Failed to load data. Please try again later.')
			}
		}

		handleUserRedirect()
	}, [routerReady, router]) // Depend on routerReady and router

	return (
		<div className="prose mx-auto max-w-5xl flex-auto">
			<h1 className="text-xl font-bold text-slate-800">
				Billing & Invoice Management
			</h1>
			<p className="mt-1 text-sm text-slate-600">
				{loadingResult || 'Loading...'}
			</p>
		</div>
	)
}
