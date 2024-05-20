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

export function ChangingPlansComponent() {
	const [plans, setPlans] = useState([])

	const [frequency, setFrequency] = useState(frequencies[0])
	const [isAnnually, setIsAnnually] = useState(false)

	const [currentSubscription, setCurrentSubscription] = useState(null)

	const router = useRouter()

	const auth = useAuth()

	useEffect(() => {
		if (frequency.value === 'annually') {
			setIsAnnually(true)
		} else {
			setIsAnnually(false)
		}
	}, [frequency])

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
		}
	}

	async function subscribe(variantId) {
		try {
			const url = await getCheckoutURL(variantId)
			await router.push(url)
		} catch (e) {
			console.error(e)
		}
	}

	if (plans.length === 0) {
		return (
			<div className={'py-20'}>
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
					<div className="col-span-1 w-full animate-pulse rounded-3xl bg-gray-200 p-8">
						<div className="flex items-center justify-between gap-x-4">
							<div className="h-4 w-1/4 rounded bg-gray-300"></div>
							<div className="h-3 w-24 rounded-full bg-gray-300 px-2.5 py-1 text-center text-xs font-semibold leading-5"></div>
						</div>
						<div className="mt-4 h-4 w-full rounded bg-gray-300"></div>
						<div className="mt-6 flex items-baseline gap-x-1">
							<div className="h-8 w-1/4 rounded bg-gray-300"></div>
							<div className="h-4 w-1/6 rounded bg-gray-300"></div>
						</div>
						<div className="mt-4 h-4 w-1/4 rounded bg-gray-300"></div>
						<div>
							<div className="mt-6 h-10 rounded bg-gray-300"></div>
						</div>
						<div className="mt-2 flex items-center">
							<div className="h-4 w-full rounded bg-gray-300"></div>
						</div>
						<ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
							<li className="flex gap-x-3">
								<div className="h-4 w-5 flex-none rounded bg-gray-300"></div>
								<div className="h-4 w-full rounded bg-gray-300"></div>
							</li>
							<li className="flex gap-x-3">
								<div className="h-4 w-5 flex-none rounded bg-gray-300"></div>
								<div className="h-4 w-full rounded bg-gray-300"></div>
							</li>
							<li className="flex gap-x-3">
								<div className="h-4 w-5 flex-none rounded bg-gray-300"></div>
								<div className="h-4 w-full rounded bg-gray-300"></div>
							</li>
						</ul>
					</div>
					<div className="col-span-1 w-full animate-pulse rounded-3xl bg-gray-200 p-8">
						<div className="flex items-center justify-between gap-x-4">
							<div className="h-4 w-1/4 rounded bg-gray-300"></div>
							<div className="h-3 w-24 rounded-full bg-gray-300 px-2.5 py-1 text-center text-xs font-semibold leading-5"></div>
						</div>
						<div className="mt-4 h-4 w-full rounded bg-gray-300"></div>
						<div className="mt-6 flex items-baseline gap-x-1">
							<div className="h-8 w-1/4 rounded bg-gray-300"></div>
							<div className="h-4 w-1/6 rounded bg-gray-300"></div>
						</div>
						<div className="mt-4 h-4 w-1/4 rounded bg-gray-300"></div>
						<div>
							<div className="mt-6 h-10 rounded bg-gray-300"></div>
						</div>
						<div className="mt-2 flex items-center">
							<div className="h-4 w-full rounded bg-gray-300"></div>
						</div>
						<ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
							<li className="flex gap-x-3">
								<div className="h-4 w-5 flex-none rounded bg-gray-300"></div>
								<div className="h-4 w-full rounded bg-gray-300"></div>
							</li>
							<li className="flex gap-x-3">
								<div className="h-4 w-5 flex-none rounded bg-gray-300"></div>
								<div className="h-4 w-full rounded bg-gray-300"></div>
							</li>
							<li className="flex gap-x-3">
								<div className="h-4 w-5 flex-none rounded bg-gray-300"></div>
								<div className="h-4 w-full rounded bg-gray-300"></div>
							</li>
						</ul>
					</div>
					<div className="col-span-2 animate-pulse rounded-3xl bg-gray-200 p-8">
						<div className="flex items-center justify-between gap-x-4">
							<div className="h-4 w-1/4 rounded bg-gray-300"></div>
							<div className="h-3 w-24 rounded-full bg-gray-300 px-2.5 py-1 text-center text-xs font-semibold leading-5"></div>
						</div>
						<div className="mt-4 h-4 w-full rounded bg-gray-300"></div>
						<div className="mt-6 flex items-baseline gap-x-1">
							<div className="h-8 w-1/4 rounded bg-gray-300"></div>
							<div className="h-4 w-1/6 rounded bg-gray-300"></div>
						</div>
						<div className="mt-4 h-4 w-1/4 rounded bg-gray-300"></div>
						<div>
							<div className="mt-6 h-10 rounded bg-gray-300"></div>
						</div>
						<div className="mt-2 flex items-center">
							<div className="h-4 w-full rounded bg-gray-300"></div>
						</div>
						<ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
							<li className="flex gap-x-3">
								<div className="h-4 w-5 flex-none rounded bg-gray-300"></div>
								<div className="h-4 w-full rounded bg-gray-300"></div>
							</li>
							<li className="flex gap-x-3">
								<div className="h-4 w-5 flex-none rounded bg-gray-300"></div>
								<div className="h-4 w-full rounded bg-gray-300"></div>
							</li>
							<li className="flex gap-x-3">
								<div className="h-4 w-5 flex-none rounded bg-gray-300"></div>
								<div className="h-4 w-full rounded bg-gray-300"></div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		)
	}

	function manageSubscription() {
		getCustomerPortalLink().then(url => router.push(url))
	}

	return (
		<div className="py-20">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="flex justify-center">
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
								key={tier.id}
								className={classNames(
									tier.mostPopular
										? 'ring-2 ring-forvoyez_orange-500'
										: 'ring-1 ring-slate-200',
									'rounded-3xl p-8'
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

								{currentSubscription ? (
									<div>
										<button
											onClick={() => manageSubscription()}
											aria-describedby={tier.id}
											className={classNames(
												tier.mostPopular
													? 'bg-forvoyez_orange-500 text-white shadow-sm hover:bg-[#e05d45]'
													: 'text-forvoyez_orange-500 ring-1 ring-inset ring-forvoyez_orange-500/20 hover:ring-[#e05d45]/30',
												'mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500'
											)}
										>
											{currentSubscription.planId === tier.id
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
											'mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500'
										)}
									>
										{tier.buttonText}
									</button>
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
						className={'rounded-3xl p-8 ring-1 ring-slate-200 lg:col-span-2'}
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
								Custom
							</span>
							<span className="text-sm font-semibold leading-6 text-slate-600">
								{frequency.priceSuffix}
							</span>
						</p>
						<p className={''}>Billed {isAnnually ? 'annually' : 'monthly'}</p>
						<Link
							href="/contact"
							aria-describedby="custom"
							className={classNames(
								'text-forvoyez_orange-500 ring-1 ring-inset ring-forvoyez_orange-500/20 hover:ring-[#e05d45]/30',
								'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500'
							)}
						>
							Contact Us
						</Link>
						<ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
							{JSON.parse(
								'["All Growth plan features","Unlimited credits","Advanced metadata generation","24/7 dedicated support","Custom SLAs","Volume discounts","Access to beta features","Priority access to new features","Priority access to the playground","Dedicated hosting option","Deep integration with existing systems"]'
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
