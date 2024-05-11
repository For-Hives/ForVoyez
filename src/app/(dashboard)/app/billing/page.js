'use client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { getCustomerPortalLink } from '@/services/lemonsqueezy.service'

export default function BillingPage() {
	const [loadingMessage, setLoadingMessage] = useState('Loading your data...')

	// Simulate checking if the user has ever been subscribed based on an error message
	async function hasEverBeenSubscribed() {
		try {
			await getCustomerPortalLink() // Attempt to get user details from Lemon Squeezy
			return true // If details are fetched successfully, assume the user has subscribed before
		} catch (error) {
			if (error.message === 'customer not found') {
				return false // User has never subscribed if "customer not found" error is returned
			}
			throw error // Rethrow any other errors to be handled later
		}
	}

	async function handleUserRedirect() {
		setLoadingMessage('Checking your subscription status...')

		try {
			const hasSubscription = await hasEverBeenSubscribed()
			if (!hasSubscription) {
				toast.info(
					'You must have been subscribed at least once to access this page.'
				)
				window.location.href = '/app/plans' // Redirect to plans page if user has never subscribed
				return
			}

			setLoadingMessage('Fetching your billing portal...')
			const url = await getCustomerPortalLink()
			// Uncomment the next line for actual redirection
			// window.location.href = url;
			setLoadingMessage('Redirecting to your billing portal...')
		} catch (error) {
			toast.error('Failed to load data: ' + error.message)
			setLoadingMessage('Failed to load data. Please try again later.')
		}
	}

	useEffect(() => {
		handleUserRedirect()
	}, []) // Empty dependency array ensures this effect runs only once when the component mounts

	return (
		<div className="prose mx-auto max-w-5xl flex-auto">
			<h1 className="text-xl font-bold text-slate-800">
				Billing & Invoice Management
			</h1>
			<p className="mt-1 text-sm text-slate-600">{loadingMessage}</p>
		</div>
	)
}
