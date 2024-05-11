'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { getCustomerPortalLink } from '@/services/lemonsqueezy.service'

export default function BillingPage() {
	// Use the router to redirect the user to the billing portal
	const router = useRouter()
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
				// Use a unique toastId to prevent multiple toasts
				if (!toast.isActive('subscription-toast')) {
					toast.info(
						'You must have been subscribed at least once to access this page.',
						{ toastId: 'subscription-toast' }
					)
				}
				return
			}

			setLoadingMessage('Fetching your billing portal...')
			const url = await getCustomerPortalLink()
			console.log('Customer portal link:', url)
			// Uncomment the next line for actual redirection
			router.replace(url) // Redirect to billing portal if user has subscribed
			setLoadingMessage('Redirecting to your billing home...')
		} catch (error) {
			if (!toast.isActive('data-load-error')) {
				if (error.message === 'Customer not found.') {
					toast.info(
						'You must have been subscribed at least once to access this page.',
						{ toastId: 'data-load-error' }
					)
					router.push('/app/plans') // Redirect to dashboard if user has never subscribed
					return
				}
				toast.error(
					'Failed to load data: ' +
						error.message +
						' ' +
						'redirect to dashboard',
					{
						toastId: 'data-load-error',
					}
				)
				router.push('/app') // Redirect to dashboard if data loading fails
			}
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
			<div className={'h-[50vh] w-full'} />
		</div>
	)
}
