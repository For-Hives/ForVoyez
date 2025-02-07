'use client'
import { ArrowUpRightIcon, CheckIcon } from '@heroicons/react/20/solid'
import { RadioGroup } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import Link from 'next/link'

import { SkeletonLoaderPricing } from '@/components/Skeletons/SkeletonLoaderPricing'
import { getPlans } from '@/services/database.service'
import { sortPlans } from '@/helpers/sortPlans'

const frequencies = [
	{ priceSuffix: '/month', value: 'monthly', label: 'Monthly' },
	{
		priceSuffix: '/year',
		value: 'annually',
		label: 'Annually',
	},
]

export function PricingComponent() {
	const [plans, setPlans] = useState([])

	const [frequency, setFrequency] = useState(frequencies[0])
	const [isAnnually, setIsAnnually] = useState(false)

	useEffect(() => {
		// when the frequency change, and it's 'annually', then, swap the flag to true
		if (frequency.value === 'annually') {
			setIsAnnually(true)
		} else {
			setIsAnnually(false)
		}
	}, [frequency])

	useEffect(() => {
		getPlans()
			.then(plans => {
				const sortedPlans = sortPlans(plans)
				setPlans(sortedPlans)
			})
			.catch(error => console.error('Error fetching usage data:', error))
	}, [])

	return (
		<div className="bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div
					className="mx-auto max-w-4xl text-center"
					data-testid="pricing-section"
					id="pricing"
				>
					<h2 className="text-forvoyez_orange-500 text-base leading-7 font-semibold">
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
						className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs leading-5 font-semibold ring-1 ring-slate-200 ring-inset"
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
								data-testid={`frequency-${option.value}`}
								key={option.value}
								value={option}
							>
								<div className={'transition-none'}>
									<span className={'transition-none'}>{option.label}</span>
									<div
										className={`${option.value === 'annually' ? 'block' : 'hidden'} border-forvoyez_orange-500 text-forvoyez_orange-500 absolute -top-7 -right-20 rounded-full border bg-white/80 p-1 px-2.5 text-xs backdrop-blur-[2px] transition-none`}
									>
										20%&nbsp;more&nbsp;tokens
									</div>
								</div>
							</RadioGroup.Option>
						))}
					</RadioGroup>
				</div>
				<div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
					{plans.length <= 0
						? [...Array(2)].map((_, i) => <SkeletonLoaderPricing key={i} />)
						: plans.map(tier => {
								if (!isAnnually && tier.billingCycle === 'year') return null
								if (isAnnually && tier.billingCycle === 'month') return null
								if (!tier.billingCycle) return null

								return (
									<div
										className={classNames(
											tier.mostPopular
												? 'ring-forvoyez_orange-500 ring-2'
												: 'ring-1 ring-slate-200',
											'rounded-3xl p-8 xl:p-10'
										)}
										data-testid={`plan-${tier.billingCycle}`}
										key={tier.id}
									>
										<div className="flex items-center justify-between gap-x-4">
											<h3
												className={classNames(
													tier.mostPopular
														? 'text-forvoyez_orange-500'
														: 'text-slate-900',
													'text-lg leading-8 font-semibold'
												)}
												id={tier.id}
											>
												{tier.name}
											</h3>
											{tier.mostPopular ? (
												<p className="bg-forvoyez_orange-500/10 text-forvoyez_orange-500 rounded-full px-2.5 py-1 text-xs leading-5 font-semibold">
													Most popular
												</p>
											) : null}
										</div>
										<p
											className="mt-4 text-sm leading-6 text-slate-600"
											dangerouslySetInnerHTML={{ __html: tier.description }}
										/>
										<p className="mt-6 flex items-baseline gap-x-1">
											<span className="text-4xl font-bold tracking-tight text-slate-900">
												{(tier.price / 100).toFixed(2).replace('.', ',')}€
											</span>
											<span className="text-sm leading-6 font-semibold text-slate-600">
												{frequency.priceSuffix}
											</span>
										</p>
										<p className={''}>
											Billed {isAnnually ? 'annually' : 'monthly'}
										</p>
										<Link
											aria-describedby={tier.id}
											className={classNames(
												tier.mostPopular
													? 'bg-forvoyez_orange-500 text-white shadow-xs hover:bg-[#e05d45]'
													: 'text-forvoyez_orange-500 ring-forvoyez_orange-500/20 ring-1 ring-inset hover:ring-[#e05d45]/30',
												'focus-visible:outline-forvoyez_orange-500 mt-6 block rounded-md px-3 py-2 text-center text-sm leading-6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
											)}
											data-testid={`plan-button-${tier.id}`}
											href="/app/plans"
										>
											{tier.buttonText}
										</Link>
										<div className={'mt-2 flex items-center'}>
											{isAnnually ? (
												<span className="text-xs text-slate-500">
													<span className={'font-bold'}>20% more tokens</span>{' '}
													than monthly
												</span>
											) : (
												<button
													className={'group m-0 flex gap-1 p-0'}
													data-testid="get-more-tokens"
													onClick={() => setFrequency(frequencies[1])}
												>
													<span className="text-xs text-slate-500 underline group-hover:text-slate-700">
														Get{' '}
														<span className={'font-bold'}>20% more tokens</span>
													</span>
													<div className={'flex h-full items-center'}>
														<ArrowUpRightIcon
															className={'h-3 w-3 text-slate-600'}
														/>
													</div>
												</button>
											)}
										</div>
										<ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600 xl:mt-10">
											{JSON.parse(tier.features).map(feature => (
												<li className="flex gap-x-3" key={feature}>
													<CheckIcon
														aria-hidden="true"
														className="text-forvoyez_orange-500 h-6 w-5 flex-none"
													/>
													{feature}
												</li>
											))}
										</ul>
									</div>
								)
							})}
					<div
						className={classNames(
							'ring-1 ring-slate-200',
							'rounded-3xl p-8 xl:p-10'
						)}
						data-testid="plan-custom"
						key="custom"
					>
						<div className="flex items-center justify-between gap-x-4">
							<h3
								className={classNames(
									'text-slate-900',
									'text-lg leading-8 font-semibold'
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
							<span className="text-sm leading-6 font-semibold text-slate-600">
								{frequency.priceSuffix}
							</span>
						</p>
						<p className={''}>Billed {isAnnually ? 'annually' : 'monthly'}</p>
						<Link
							aria-describedby="custom"
							className={classNames(
								'text-forvoyez_orange-500 ring-forvoyez_orange-500/20 ring-1 ring-inset hover:ring-[#e05d45]/30',
								'focus-visible:outline-forvoyez_orange-500 mt-6 block rounded-md px-3 py-2 text-center text-sm leading-6 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
							)}
							data-testid="contact-us"
							href="/contact"
						>
							Contact Us
						</Link>

						<ul className="mt-8 space-y-3 text-sm leading-6 text-slate-600 xl:mt-10">
							{JSON.parse(
								'["All Growth plan features","Unlimited image descriptions*","Advanced metadata generation","24/7 dedicated support","Custom SLAs","Volume discounts","Access to beta features","Priority access to new features","Priority access to the playground","Dedicated hosting option","Deep integration with existing systems"]'
							).map(feature => (
								<li className="flex gap-x-3" key={feature}>
									<CheckIcon
										aria-hidden="true"
										className="text-forvoyez_orange-500 h-6 w-5 flex-none"
									/>
									{feature}
								</li>
							))}
						</ul>
					</div>
				</div>
				<p className={'mt-4 w-full text-right text-slate-600'}>
					(*), 1 credit correspond to 1 image description with ForVoyez API.
				</p>
			</div>
		</div>
	)
}

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}
