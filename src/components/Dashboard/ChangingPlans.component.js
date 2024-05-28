'use client'
import { useEffect, useState } from 'react'

import { ArrowUpRightIcon, CheckIcon } from '@heroicons/react/20/solid'
import { RadioGroup } from '@headlessui/react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'

import {
	getCheckoutURL,
	getCustomerPortalLink,
} from '@/services/lemonsqueezy.service'
import {
	getPlans,
	getSubscriptionFromUserId,
} from '@/services/database.service'
import { SkeletonLoaderPricing } from '@/components/Skeletons/SkeletonLoaderPricing'
import { sortPlans } from '@/helpers/sortPlans'

const frequencies = [
	{ priceSuffix: '/month', value: 'monthly', label: 'Monthly' },
	{
		priceSuffix: '/year',
		value: 'annually',
		label: 'Annually',
	},
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export function ChangingPlansComponent() {
	const [plans, setPlans] = useState([])
	const [frequency, setFrequency] = useState(frequencies[0])
	const [isAnnually, setIsAnnually] = useState(false)
	const [currentSubscription, setCurrentSubscription] = useState(null)
	const [urls, setUrls] = useState({})
	const auth = useAuth()

	useEffect(() => {
		if (frequency.value === 'annually') {
			setIsAnnually(true)
		} else {
			setIsAnnually(false)
		}
	}, [frequency])

	useEffect(() => {
		const fetchPlansAndUrls = async () => {
			const fetchedPlans = await getPlans()

			const sortedPlans = sortPlans(fetchedPlans)

			setPlans(sortedPlans)
			await checkSubscription()

			const newUrls = {}
			for (const plan of sortedPlans) {
				if (currentSubscription && currentSubscription.planId === plan.id) {
					newUrls[plan.id] = await getCustomerPortalLink()
				} else {
					newUrls[plan.id] = await getCheckoutURL(plan.variantId)
				}
			}

			setUrls(newUrls)
		}

		fetchPlansAndUrls()
	}, [currentSubscription])

	async function checkSubscription() {
		const sub = await getSubscriptionFromUserId(auth.userId)
		if (sub) {
			setCurrentSubscription(sub)
		}
	}

	if (plans.length === 0 || Object.keys(urls).length === 0) {
		return (
			<div className={'py-20'} data-testid="plans-loading">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="flex justify-center pb-20">
						<div
							className={
								'relative grid h-8 w-32 grid-cols-2 gap-x-1 rounded-full p-1 ring-1 ring-inset ring-slate-200'
							}
						>
							<div
								className={
									'animate-pulse rounded-full bg-slate-200 px-2.5 py-1'
								}
							/>
							<div
								className={'animate-pulse rounded-full bg-slate-50 px-2.5 py-1'}
							/>
							<div
								className={
									'absolute -right-8 -top-4 h-6 w-16 animate-pulse rounded-full bg-slate-100 px-2.5 py-1'
								}
							/>
						</div>
					</div>
				</div>
				<div className={'flex w-full flex-col gap-8 md:grid md:grid-cols-2'}>
					{[...Array(2)].map((_, i) => (
						<SkeletonLoaderPricing key={i} />
					))}
					<div className="col-span-2">
						<SkeletonLoaderPricing />
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="py-20">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="flex justify-center">
					<RadioGroup
						className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-slate-200"
						data-testid="plans-frequency"
						onChange={setFrequency}
						value={frequency}
					>
						<RadioGroup.Label className="sr-only">
							Payment frequency
						</RadioGroup.Label>
						{frequencies.map(option => (
							<RadioGroup.Option
								className={({ checked }) =>
									classNames(
										checked
											? 'bg-forvoyez_orange-500 text-white'
											: 'text-slate-500',
										'relative cursor-pointer rounded-full px-2.5 py-1 transition-none'
									)
								}
								data-testid={`plans-frequency-${option.value}`}
								key={option.value}
								value={option}
							>
								<div className={'transition-none'}>
									<span className={'transition-none'}>{option.label}</span>
									<div
										className={`${option.value === 'annually' ? 'block' : 'hidden'} absolute 
                    -right-20 -top-7 rounded-full border border-forvoyez_orange-500 bg-white/80 p-1 px-2.5 text-xs text-forvoyez_orange-500 backdrop-blur-[2px] transition-none`}
									>
										20%&nbsp;more&nbsp;tokens
									</div>
								</div>
							</RadioGroup.Option>
						))}
					</RadioGroup>
				</div>
				<div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
					{plans.map(tier => {
						if (!isAnnually && tier.billingCycle === 'year') return null
						if (isAnnually && tier.billingCycle === 'month') return null
						if (!tier.billingCycle) return null

						return (
							<div
								className={classNames(
									tier.mostPopular
										? 'ring-2 ring-forvoyez_orange-500'
										: 'ring-1 ring-slate-200',
									'rounded-3xl p-8'
								)}
								data-testid={`plan-${tier.billingCycle}-${tier.id}`}
								key={tier.id}
							>
								<div className="flex items-center justify-between gap-x-4">
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
									<span className="text-sm font-semibold leading-6 text-slate-600">
										{frequency.priceSuffix}
									</span>
								</p>
								<p className={''}>
									Billed {isAnnually ? 'annually' : 'monthly'}
								</p>

								{currentSubscription
									? urls[tier.id] && (
											<div>
												<Link
													aria-describedby={tier.id}
													className={classNames(
														tier.mostPopular
															? 'bg-forvoyez_orange-500 text-white shadow-sm hover:bg-[#e05d45]'
															: 'text-forvoyez_orange-500 ring-1 ring-inset ring-forvoyez_orange-500/20 hover:ring-[#e05d45]/30',
														'mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500'
													)}
													data-testid={`subscribe-button-${tier.id}`}
													href={urls[tier.id]}
												>
													{currentSubscription.planId === tier.id
														? 'Manage my Subscription'
														: 'Change Plan'}
												</Link>
											</div>
										)
									: urls[tier.id] && (
											<Link
												aria-describedby={tier.id}
												className={classNames(
													tier.mostPopular
														? 'bg-forvoyez_orange-500 text-white shadow-sm hover:bg-[#e05d45]'
														: 'text-forvoyez_orange-500 ring-1 ring-inset ring-forvoyez_orange-500/20 hover:ring-[#e05d45]/30',
													'mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500'
												)}
												data-testid={`subscribe-button-${tier.id}`}
												href={urls[tier.id]}
											>
												{tier.buttonText}
											</Link>
										)}
								<div className={'mt-2 flex items-center'}>
									{isAnnually ? (
										<span className="text-xs text-slate-500">
											<span className={'font-bold'}>20% more tokens</span> than
											monthly
										</span>
									) : (
										<button
											className={'group m-0 flex gap-1 p-0'}
											data-testid="more-tokens-button"
											onClick={() => setFrequency(frequencies[1])}
										>
											<span className="text-xs text-slate-500 underline group-hover:text-slate-700">
												Get <span className={'font-bold'}>20% more tokens</span>
											</span>
											<div className={'flex h-full items-center'}>
												<ArrowUpRightIcon
													className={'h-3 w-3 text-slate-600'}
												/>
											</div>
										</button>
									)}
								</div>
								<ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
									{JSON.parse(tier.features).map(feature => (
										<li className="flex gap-x-3" key={feature}>
											<CheckIcon
												aria-hidden="true"
												className="h-6 w-5 flex-none text-forvoyez_orange-500"
											/>
											{feature}
										</li>
									))}
								</ul>
							</div>
						)
					})}
					<div
						className={'rounded-3xl p-8 ring-1 ring-slate-200 lg:col-span-2'}
						data-testid="plan-custom"
						key="custom"
					>
						<div className="flex items-center justify-between gap-x-4">
							<h3
								className={classNames(
									'text-slate-900',
									'text-lg font-semibold leading-8'
								)}
								id="custom"
							>
								Entreprise
							</h3>
						</div>
						<p className="mt-4 text-sm leading-6 text-slate-600">
							Tailored for large-scale deployments and complex requirements.
						</p>
						<p className="mt-6 flex items-baseline gap-x-1">
							<span className="text-4xl font-bold tracking-tight text-slate-900">
								Custom
							</span>
							<span className="text-sm font-semibold leading-6 text-slate-600">
								{frequency.priceSuffix}
							</span>
						</p>
						<p className={''}>Billed {isAnnually ? 'annually' : 'monthly'}</p>
						<Link
							aria-describedby="custom"
							className={classNames(
								'text-forvoyez_orange-500 ring-1 ring-inset ring-forvoyez_orange-500/20 hover:ring-[#e05d45]/30',
								'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500'
							)}
							data-testid="subscribe-button-custom"
							href="/contact"
						>
							Contact Us
						</Link>
						<ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
							{JSON.parse(
								'["All Growth plan features","Unlimited credits*","Advanced metadata generation","24/7 dedicated support","Custom SLAs","Volume discounts","Access to beta features","Priority access to new features","Priority access to the playground","Dedicated hosting option","Deep integration with existing systems"]'
							).map(feature => (
								<li className="flex gap-x-3" key={feature}>
									<CheckIcon
										aria-hidden="true"
										className="h-6 w-5 flex-none text-forvoyez_orange-500"
									/>
									{feature}
								</li>
							))}
						</ul>
					</div>
				</div>
				<p className={'mt-4 w-full text-right text-slate-600'}>
					<span className={'font-bold'}>1 credit</span>&nbsp;=&nbsp;
					<span className={'font-bold'}>1 image</span> analysis*
				</p>
			</div>
		</div>
	)
}
