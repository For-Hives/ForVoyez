'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { createCheckoutUrl } from '@/app/actions/app/plans'
import { track } from '@/helpers/analytics'

// Plan button of the dashboard. The Lemon Squeezy checkout is created when the
// user clicks it, not when the plans are shown, then the browser goes to it.
// `analytics` describes the plan for the Umami events: { plan, cycle, kind }.
export function CheckoutButtonComponent({ className, variantId, children, analytics, ...props }) {
	const router = useRouter()
	const [isPending, setIsPending] = useState(false)

	useEffect(() => {
		// Back from the checkout, the browser may restore this page from its
		// back/forward cache with the button still pending.
		const releaseButton = event => {
			if (event.persisted) setIsPending(false)
		}
		window.addEventListener('pageshow', releaseButton)
		return () => window.removeEventListener('pageshow', releaseButton)
	}, [])

	async function openCheckout() {
		// the click, then whether a checkout came back to go to
		track('plans-checkout-click', analytics)
		setIsPending(true)
		try {
			const url = await createCheckoutUrl(variantId)
			// external URL: the router does a full page navigation
			router.push(url)
			track('plans-checkout-result', { ...analytics, outcome: 'ok' })
		} catch (error) {
			track('plans-checkout-result', { ...analytics, outcome: 'error' })
			console.error('Error creating checkout:', error)
			toast.error('Could not open the checkout. Please try again.', {
				toastId: 'checkout-error',
			})
			setIsPending(false)
		}
	}

	return (
		<button
			{...props}
			aria-busy={isPending}
			className={`${className} cursor-pointer disabled:cursor-wait disabled:opacity-60`}
			disabled={isPending}
			onClick={openCheckout}
			type="button"
		>
			{children}
		</button>
	)
}
