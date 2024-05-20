'use client'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import {
	getPlans,
	getSubscriptionFromUserId,
} from '@/services/database.service'
import {
	getCheckoutURL,
	getCustomerPortalLink,
} from '@/services/lemonsqueezy.service'

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export function RefillPlansComponent() {
	const router = useRouter()
	const auth = useAuth()

	const [plans, setPlans] = useState([])
	const [currentSubscription, setCurrentSubscription] = useState(null)
	const [currentPlanName, setCurrentPlanName] = useState(null)

	useEffect(() => {
		getPlans().then(plans => {
			plans.sort((a, b) => {
				// Extract the numbers from the plan names
				const numA = parseInt(a.name.match(/\d+/)?.[0] || '0')
				const numB = parseInt(b.name.match(/\d+/)?.[0] || '0')

				// Compare the numbers
				if (numA !== numB) {
					return numA - numB
				}

				// If the numbers are the same, compare the names
				return b.name.localeCompare(a.name)
			})
			setPlans(plans)
		})
		checkSubscription()
	}, [])

	async function checkSubscription() {
		const sub = await getSubscriptionFromUserId(auth.userId)


		if (sub) {
			setCurrentSubscription(sub)
		} else {
			setCurrentSubscription(null)
		}
	}

	async function subscribe(variantId) {
		try {
			const existingSubscription =
				currentSubscription && currentSubscription.planId === variantId
			if (existingSubscription) {
				toast.info('You are already subscribed to this plan')
				return // Prevent subscription if already subscribed
			}

			const url = await getCheckoutURL(variantId)
			await router.push(url)
		} catch (e) {
			console.error(e)
		}
	}

	if (plans.length === 0) {
		return <div className="bg-white py-24 sm:py-32">loading...</div>
	}

	function manageSubscription() {
		getCustomerPortalLink().then(url => router.push(url))
	}

	return (
		<>
			{
				// if the user is subscribed, show the refill section
				currentSubscription && (
					<>
						<h2 className="text-xl font-bold text-slate-800">Refill Plans</h2>
						<p className="mt-1 text-sm text-slate-600">
							This is where you can view and manage your refill options. Refill
							plans allow you to add additional resources to your current
							subscription as needed. Select the refill plan that matches your
							anticipated usage to ensure you have enough resources available at
							all times.
						</p>
						<div className="pb-20">
							<div className="mx-auto max-w-7xl px-6 lg:px-8">
								<div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
									{plans.map(tier => {
										if (tier.billingCycle) return null

										// Add a check to ensure currentSubscription.planName exists
										const isCurrentPlanGrowth =
											currentSubscription?.plan?.name?.includes('Growth')
										const isCurrentPlanStarter =
											currentSubscription?.plan?.name?.includes('Starter')

										// Filter plans based on current subscription
										if (
											isCurrentPlanGrowth &&
											!tier.productName.includes('Growth')
										)
											return null
										if (
											isCurrentPlanStarter &&
											!tier.productName.includes('Starter')
										)
											return null

										return (
											<div
												key={tier.id}
												className={classNames(
													tier.mostPopular
														? 'ring-2 ring-forvoyez_orange-500'
														: 'ring-1 ring-slate-200',
													'flex flex-col rounded-3xl p-8'
												)}
											>
												<div className="flex h-1/4 items-start justify-between gap-x-4">
													<h3
														id={tier.id}
														className={classNames(
															tier.mostPopular
																? 'text-forvoyez_orange-500'
																: 'text-slate-900',
															'text-lg font-semibold leading-8'
														)}
													>
														{tier.name}
													</h3>
													{tier.mostPopular ? (
														<p className="rounded-full bg-forvoyez_orange-500/10 px-2.5 py-1 text-center text-xs font-semibold leading-5 text-forvoyez_orange-500">
															Most popular
														</p>
													) : null}
												</div>
												<p
													className="mt-4 text-sm leading-6 text-slate-600"
													dangerouslySetInnerHTML={{
														__html: tier.description,
													}}
												/>
												<p className="mt-6 flex items-baseline gap-x-1">
													<span className="text-4xl font-bold tracking-tight text-slate-900">
														{(tier.price / 100).toFixed(2).replace('.', ',')}€
													</span>
												</p>
												<p className={''}>One time refill</p>

												{currentSubscription && (
													<div>
														<button
															onClick={() => subscribe(tier.variantId)}
															aria-describedby={tier.id}
															className={classNames(
																tier.mostPopular
																	? 'bg-forvoyez_orange-500 text-white shadow-sm hover:bg-[#e05d45]'
																	: 'text-forvoyez_orange-500 ring-1 ring-inset ring-forvoyez_orange-500/20 hover:ring-[#e05d45]/30',
																'mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500'
															)}
														>
															Refill your credits
														</button>
													</div>
												)}
											</div>
										)
									})}
								</div>
							</div>
						</div>
					</>
				)
			}
		</>
	)
}
