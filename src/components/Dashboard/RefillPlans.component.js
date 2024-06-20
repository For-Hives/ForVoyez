'use client'
import { useEffect, useState } from 'react'

import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'

import {
	getPlans,
	getSubscriptionFromUserId,
} from '@/services/database.service'
import { getCheckoutsLinks } from '@/services/lemonsqueezy.service'
import { sortPlans } from '@/helpers/sortPlans'

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export function RefillPlansComponent() {
	const auth = useAuth()

	const [plans, setPlans] = useState([])
	const [currentSubscription, setCurrentSubscription] = useState(null)
	const [checkoutUrls, setCheckoutUrls] = useState(null)

	useEffect(() => {
		const fetchPlans = async () => {
			try {
				const plans = await getPlans()
				const sortedPlans = sortPlans(plans)
				setPlans(sortedPlans)
				await fetchCheckoutUrls(sortedPlans)
			} catch (error) {
				console.error('Error fetching plans:', error)
			}
		}

		const fetchSubscription = async () => {
			try {
				const sub = await getSubscriptionFromUserId(auth.userId)
				if (sub) {
					setCurrentSubscription(sub)
				}
			} catch (error) {
				console.error('Error fetching subscription:', error)
			}
		}

		const fetchCheckoutUrls = async plans => {
			if (!plans) return

			try {
				const checkouts = await getCheckoutsLinks(plans)
				setCheckoutUrls(checkouts)
			} catch (error) {
				console.error('Error fetching checkouts:', error)
			}
		}

		fetchPlans()
		fetchSubscription()
	}, [auth.userId])

	if (plans.length === 0 || !checkoutUrls) {
		return (
			<>
				<div className="animate-pulse">
					<div className="mb-2 h-6 w-1/4 rounded bg-slate-200"></div>
					<div className="mb-2 h-4 w-full rounded bg-slate-200"></div>
					<div className="mb-2 h-4 w-9/12 rounded bg-slate-200"></div>
					<div className="mb-2 h-4 w-2/3 rounded bg-slate-200"></div>
					<div className="mb-2 h-4 w-1/2 rounded bg-slate-200"></div>
					<div className="mb-2 h-4 w-3/4 rounded bg-slate-200"></div>
					<div className="mb-2 h-4 w-3/5 rounded bg-slate-200"></div>
					<div className="mb-2 h-4 w-1/3 rounded bg-slate-200"></div>
				</div>
				<div className="mx-auto max-w-7xl animate-pulse px-6 lg:px-8">
					<div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
						<div className="mb-8 h-64 rounded-xl bg-slate-200"></div>
						<div className="mb-8 h-64 rounded-xl bg-slate-200"></div>
						<div className="mb-8 h-64 rounded-xl bg-slate-200"></div>
					</div>
				</div>
			</>
		)
	}

	return (
		<>
			{currentSubscription && (
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
											className={classNames(
												tier.mostPopular
													? 'ring-2 ring-forvoyez_orange-500'
													: 'ring-1 ring-slate-200',
												'flex flex-col rounded-3xl p-8'
											)}
											data-testid={`plan-${tier.id}`}
											key={tier.id}
										>
											<div className="flex h-1/4 items-start justify-between gap-x-4">
												<h3
													className={classNames(
														tier.mostPopular
															? 'text-forvoyez_orange-500'
															: 'text-slate-900',
														'text-lg font-semibold leading-8'
													)}
													id={tier.id}
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
											<p className={''}>One time payment to refill</p>

											{currentSubscription && checkoutUrls[tier.variantId] && (
												<div>
													<Link
														aria-describedby={tier.id}
														className={classNames(
															tier.mostPopular
																? 'bg-forvoyez_orange-500 text-white shadow-sm hover:bg-[#e05d45]'
																: 'text-forvoyez_orange-500 ring-1 ring-inset ring-forvoyez_orange-500/20 hover:ring-[#e05d45]/30',
															'mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500'
														)}
														data-testid={`subscribe-${tier.variantId}`}
														href={checkoutUrls[tier.variantId]}
													>
														Refill your credits
													</Link>
												</div>
											)}
										</div>
									)
								})}
							</div>
							<p className={'mt-4 w-full text-right text-slate-600'}>
								<span className={'font-bold'}>1 credit</span>&nbsp;=&nbsp;
								<span className={'font-bold'}>1 image</span> descriptions*
							</p>
						</div>
					</div>
				</>
			)}
		</>
	)
}
