'use client'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { useRouter } from 'next/navigation'

import { createCheckoutUrl } from '@/app/actions/app/plans'

// Plan button of the dashboard. The Lemon Squeezy checkout is created when the
// user clicks it, not when the plans are shown, then the browser goes to it.
export function CheckoutButtonComponent({
	className,
	variantId,
	children,
	...props
}) {
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
		setIsPending(true)
		try {
			const url = await createCheckoutUrl(variantId)
			// external URL: the router does a full page navigation
			router.push(url)
		} catch (error) {
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
