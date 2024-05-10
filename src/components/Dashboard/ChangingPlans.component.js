'use client'
import { useAuth } from '@clerk/nextjs'
import { RadioGroup } from '@headlessui/react'
import { ArrowUpRightIcon, CheckIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
	getPlans,
	getSubscriptionFromUserId,
} from '@/services/database.service'
import {
	getCheckoutURL,
	getCustomerPortalLink,
} from '@/services/lemonsqueezy.service'

// FIXME replace the pricing with the correct one, from lemon squeezy
const frequencies = [
	{ value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
	{
		value: 'annually',
		label: 'Annually',
		priceSuffix: '/year',
	},
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

// TODO : manage DangerouslySetInnerHTML for description
export function ChangingPlansComponent() {
	const [plans, setPlans] = useState([])

	const [frequency, setFrequency] = useState(frequencies[0])
	const [isAnnually, setIsAnnually] = useState(false)

	const [currentSubscription, setCurrentSubscription] = useState(null)

	const router = useRouter()

	const auth = useAuth()

	useEffect(() => {
		// when the frequency change, and it's 'annually', then, swap the flag to true
		if (frequency.value === 'annually') {
			setIsAnnually(true)
		} else {
			setIsAnnually(false)
		}
	}, [frequency])

	useEffect(() => {
		getPlans().then(setPlans)
		checkSubscription()
	}, [])

	async function checkSubscription() {
		const sub = await getSubscriptionFromUserId(auth.userId)

		if (sub) {
			setCurrentSubscription(sub)
		}
	}

	// while no data is fetched, show a loading spinner
	async function subscribe(variantId) {
		try {
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
		<div className="bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-4xl text-center" id={'pricing'}>
					<h2 className="text-base font-semibold leading-7 text-forvoyez_orange-500">
						Pricing
					</h2>
					<p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
						Plans for every stage of your growth
					</p>
				</div>
				<p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-600">
					Choose the plan that fits your needs and scale as your usage grows.
					Upgrade, downgrade, or cancel anytime.
				</p>
				<div className="mt-16 flex justify-center">
					<RadioGroup
						value={frequency}
						onChange={setFrequency}
						className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-slate-200"
					>
						<RadioGroup.Label className="sr-only">
							Payment frequency
						</RadioGroup.Label>
						{frequencies.map(option => (
							<RadioGroup.Option
								key={option.value}
								value={option}
								className={({ checked }) =>
									classNames(
										checked
											? 'bg-forvoyez_orange-500 text-white'
											: 'text-slate-500',
										'relative cursor-pointer rounded-full px-2.5 py-1 transition-none'
									)
								}
							>
								<div className={'transition-none'}>
									<span className={'transition-none'}>{option.label}</span>
									<div
										className={`${option.value === 'annually' ? 'block' : 'hidden'} absolute
										-right-4 -top-5 rounded-full 
										border border-forvoyez_orange-500 bg-white/80 p-1 px-1.5 text-xs text-forvoyez_orange-500 backdrop-blur-[2px] transition-none`}
									>
										Save 20%
									</div>
								</div>
							</RadioGroup.Option>
						))}
					</RadioGroup>
				</div>
				<div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
					{plans.map(tier => {
						if (!isAnnually && tier.billingCycle === 'year') return null
						if (isAnnually && tier.billingCycle === 'month') return null

						return (
							<div
								key={tier.id}
								className={classNames(
									tier.mostPopular
										? 'ring-2 ring-forvoyez_orange-500'
										: 'ring-1 ring-slate-200',
									'rounded-3xl p-8 xl:p-10'
								)}
							>
								<div className="flex items-center justify-between gap-x-4">
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
										<p className="rounded-full bg-forvoyez_orange-500/10 px-2.5 py-1 text-xs font-semibold leading-5 text-forvoyez_orange-500">
											Most popular
										</p>
									) : null}
								</div>
								<p className="mt-4 text-sm leading-6 text-slate-600">
									{tier.description}
								</p>
								<p className="mt-6 flex items-baseline gap-x-1">
									<span className="text-4xl font-bold tracking-tight text-slate-900">
										{/* format to price in € */}
										{tier.price / 100}€
									</span>
									<span className="text-sm font-semibold leading-6 text-slate-600">
										{frequency.priceSuffix}
									</span>
								</p>
								<p className={''}>
									Billed {isAnnually ? 'annually' : 'monthly'}
								</p>

								{currentSubscription ? (
									<div>
										<button
											onClick={() => manageSubscription()}
											aria-describedby={tier.id}
											className={classNames(
												tier.mostPopular
													? 'bg-forvoyez_orange-500 text-white shadow-sm hover:bg-[#e05d45]'
													: 'text-forvoyez_orange-500 ring-1 ring-inset ring-forvoyez_orange-500/20 hover:ring-[#e05d45]/30',
												'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500'
											)}
										>
											{currentSubscription.planId == tier.id
												? 'Manage my Subscription'
												: 'Change Plan'}
										</button>
									</div>
								) : (
									<button
										onClick={() => subscribe(tier.variantId)}
										aria-describedby={tier.id}
										className={classNames(
											tier.mostPopular
												? 'bg-forvoyez_orange-500 text-white shadow-sm hover:bg-[#e05d45]'
												: 'text-forvoyez_orange-500 ring-1 ring-inset ring-forvoyez_orange-500/20 hover:ring-[#e05d45]/30',
											'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500'
										)}
									>
										{tier.buttonText}
									</button>
								)}
								<div className={'mt-2 flex h-[18px] items-center'}>
									{isAnnually ? (
										<span className="text-xs text-slate-500">
											<span className={'font-bold'}>20% cheaper</span> than
											monthly
										</span>
									) : (
										<button
											className={'m-0 flex gap-1 p-0'}
											onClick={() => setFrequency(frequencies[1])}
										>
											<span className="text-xs text-slate-500">
												Get <span className={'font-bold'}>20% off</span> with
												an&nbsp;<span className={'font-bold'}>annual</span>
												&nbsp;subscription
											</span>
											<div className={'flex h-full items-center'}>
												{/*	Link icon*/}
												<ArrowUpRightIcon
													className={'h-3 w-3 text-slate-600'}
												/>
											</div>
										</button>
									)}
								</div>
								<ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600 xl:mt-10">
									{JSON.parse(tier.features).map(feature => (
										<li key={feature} className="flex gap-x-3">
											<CheckIcon
												className="h-6 w-5 flex-none text-forvoyez_orange-500"
												aria-hidden="true"
											/>
											{feature}
										</li>
									))}
								</ul>
							</div>
						)
					})}
					<div
						key="custom"
						className={classNames(
							'ring-1 ring-slate-200',
							'rounded-3xl p-8 xl:p-10'
						)}
					>
						<div className="flex items-center justify-between gap-x-4">
							<h3
								id="custom"
								className={classNames(
									'text-slate-900',
									'text-lg font-semibold leading-8'
								)}
							>
								Entreprise
							</h3>
						</div>
						<p className="mt-4 text-sm leading-6 text-slate-600">
							Tailored for large-scale deployments and complex requirements.
						</p>
						<p className="mt-6 flex items-baseline gap-x-1">
							<span className="text-4xl font-bold tracking-tight text-slate-900">
								{/* format to price in € */}
								Custom
							</span>
							<span className="text-sm font-semibold leading-6 text-slate-600">
								{frequency.priceSuffix}
							</span>
						</p>
						<p className={''}>Billed {isAnnually ? 'annually' : 'monthly'}</p>
						<Link
							href="#"
							aria-describedby="custom"
							className={classNames(
								'text-forvoyez_orange-500 ring-1 ring-inset ring-forvoyez_orange-500/20 hover:ring-[#e05d45]/30',
								'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500'
							)}
						>
							Contact Us
						</Link>
						<div className={'mt-2 flex h-[18px] items-center'}>
							{isAnnually ? (
								<span className="text-xs text-slate-500">
									<span className={'font-bold'}>20% cheaper</span> than monthly
								</span>
							) : (
								<button
									className={'m-0 flex gap-1 p-0'}
									onClick={() => setFrequency(frequencies[1])}
								>
									<span className="text-xs text-slate-500">
										Get <span className={'font-bold'}>20% off</span> with
										an&nbsp;<span className={'font-bold'}>annual</span>
										&nbsp;subscription
									</span>
									<div className={'flex h-full items-center'}>
										{/*	Link icon*/}
										<ArrowUpRightIcon className={'h-3 w-3 text-slate-600'} />
									</div>
								</button>
							)}
						</div>
						<ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600 xl:mt-10">
							{JSON.parse(
								'["100 credits/month", "Basic metadata generation", "Community support", "Accept classic image formats, (JPEG, PNG, WEBP)", "Full HD image support, (up to 1080p)"]'
							).map(feature => (
								<li key={feature} className="flex gap-x-3">
									<CheckIcon
										className="h-6 w-5 flex-none text-forvoyez_orange-500"
										aria-hidden="true"
									/>
									{feature}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
