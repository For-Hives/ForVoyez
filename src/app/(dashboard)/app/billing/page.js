'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getCustomerPortalUrl } from '@/app/actions/app/plans'
import { Transition } from '@/components/Transitions/Transition.component'
import { track } from '@/helpers/analytics'

export default function BillingPage() {
	const router = useRouter()
	const [loadingMessage, setLoadingMessage] = useState('Loading your data...')

	function redirectToPlans(toastId) {
		if (!toast.isActive(toastId)) {
			toast.info('You must have been subscribed at least once to access this page.', { toastId })
		}
		router.push('/app/plans')
	}

	async function handleUserRedirect() {
		setLoadingMessage('Checking your subscription status...')

		try {
			// null when the user never bought anything (no customer portal)
			const url = await getCustomerPortalUrl()

			if (!url) {
				redirectToPlans('subscription-toast')
				// expected for an account that never bought anything: no portal to open
				track('billing-portal-redirect', { outcome: 'error', status: 'no-customer' })
				return
			}

			setLoadingMessage('Fetching your billing portal...')
			router.replace(url)
			track('billing-portal-redirect', { outcome: 'ok', status: 'portal' })
			setLoadingMessage('Redirecting to your billing home...')
		} catch (error) {
			track('billing-portal-redirect', { outcome: 'error', status: 'exception' })
			console.error('Error during user redirect:', error) // Log the error for debugging
			redirectToPlans('data-load-error')
			setLoadingMessage('Failed to load data. Please try again later.')
		}
	}

	useEffect(() => {
		handleUserRedirect()
	}, [])

	return (
		<div className="prose mx-auto max-w-5xl flex-auto">
			<Transition name="resource-billing-title">
				<h1 className="text-xl font-bold text-slate-800">Billing & Invoice Management</h1>
			</Transition>
			<Transition name="resource-billing-description">
				<p className="mt-1 text-sm text-slate-600">{loadingMessage}</p>
			</Transition>
			<div className={'h-[50vh] w-full'} />
		</div>
	)
}
