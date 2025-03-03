'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { useRouter } from 'next/navigation'

import { getCustomerPortalLink } from '@/services/lemonsqueezy.service'

export default function BillingPage() {
	const router = useRouter()
	const [loadingMessage, setLoadingMessage] = useState('Loading your data...')

	async function hasEverBeenSubscribed() {
		try {
			await getCustomerPortalLink()
			return true
		} catch (error) {
			if (error.message === 'customer not found') {
				return false
			}
			throw error
		}
	}

	async function handleUserRedirect() {
		setLoadingMessage('Checking your subscription status...')

		try {
			const hasSubscription = await hasEverBeenSubscribed()
			if (!hasSubscription) {
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

			if (url) {
				router.replace(url)
				setLoadingMessage('Redirecting to your billing home...')
			} else {
				throw new Error('Received null URL from getCustomerPortalLink')
			}
		} catch (error) {
			console.error('Error during user redirect:', error) // Log the error for debugging
			if (!toast.isActive('data-load-error')) {
				if (error.message === 'Customer not found.') {
					toast.info(
						'You must have been subscribed at least once to access this page.',
						{ toastId: 'data-load-error' }
					)
					router.push('/app/plans')
					return
				}
				toast.info(
					'You must have been subscribed at least once to access this page.',
					{ toastId: 'data-load-error' }
				)
				router.push('/app/plans')
			}
			setLoadingMessage('Failed to load data. Please try again later.')
		}
	}

	useEffect(() => {
		handleUserRedirect()
	}, [])

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
