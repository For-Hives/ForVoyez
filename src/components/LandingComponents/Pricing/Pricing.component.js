'use client'
import { useEffect, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { ArrowUpRightIcon, CheckIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

const frequencies = [
	{ value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
	{ value: 'annually', label: 'Annually', priceSuffix: '/year' },
]
const tiers = [
	{
		name: 'Starter',
		id: 'tier-starter',
		href: '#',
		price: { monthly: '€2.99', annually: '€29.90' },
		description: 'Ideal for small projects, independents and personal use.',
		features: [
			'100 credits/month',
			'Basic metadata generation',
			'Community support',
			'Accept classic image formats, (JPEG, PNG, WEBP)',
			'Full HD image support, (up to 1080p)',
		],
		mostPopular: false,
		buttonText: 'Subscribe',
	},
	{
		name: 'Growth',
		id: 'tier-growth',
		href: '#',
		price: { monthly: '€24.90', annually: '€249.00' },
		description: 'Perfect for growing businesses and advanced users.',
		features: [
			'All Starter features',
			'1,000 credits/month',
			'Advanced metadata generation',
			'Priority support',
			'Bulk processing',
			'Accept modern image formats, (AVIF, HEIC, JPEG-XR, JPEG 2000)',
			'Ultra HD image support, (up to 4K)',
		],
		mostPopular: true,
		buttonText: 'Subscribe',
	},
	{
		name: 'Enterprise',
		id: 'tier-enterprise',
		href: '#',
		price: { monthly: 'Custom', annually: 'Custom' },
		description:
			'Tailored for large-scale deployments and complex requirements.',
		features: [
			'All Growth features',
			'Unlimited credits',
			'Advanced metadata generation',
			'24/7 dedicated support',
			'Custom SLAs',
			'Volume discounts',
			'Access to beta features',
			'Access to playground',
			'Accept all* image formats',
		],
		mostPopular: false,
		buttonText: 'Contact us',
	},
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export function PricingComponent() {
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

	return (
		<div className="bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="text-base font-semibold leading-7 text-[#ff6545]">
						Pricing
					</h2>
					<p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
						Plans for every stage of your growth
					</p>
				</div>
				<p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
					Choose the plan that fits your needs and scale as your usage grows.
					Upgrade, downgrade, or cancel anytime.
				</p>
				<div className="mt-16 flex justify-center">
					<RadioGroup
						value={frequency}
						onChange={setFrequency}
						className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
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
										checked ? 'bg-[#ff6545] text-white' : 'text-gray-500',
										'relative cursor-pointer rounded-full px-2.5 py-1 transition-none'
									)
								}
							>
								<div className={'transition-none'}>
									<span className={'transition-none'}>{option.label}</span>
									<div
										className={`${
											option.value === 'annually' ? 'block' : 'hidden'
										} absolute
										-right-4 -top-5 rounded-full 
										border border-[#ff6545] bg-white/80 p-1 px-1.5 text-xs text-[#ff6545] backdrop-blur-[2px] transition-none`}
									>
										Save 20%
									</div>
								</div>
							</RadioGroup.Option>
						))}
					</RadioGroup>
				</div>
				<div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
					{tiers.map(tier => (
						<div
							key={tier.id}
							className={classNames(
								tier.mostPopular
									? 'ring-2 ring-[#ff6545]'
									: 'ring-1 ring-gray-200',
								'rounded-3xl p-8 xl:p-10'
							)}
						>
							<div className="flex items-center justify-between gap-x-4">
								<h3
									id={tier.id}
									className={classNames(
										tier.mostPopular ? 'text-[#ff6545]' : 'text-gray-900',
										'text-lg font-semibold leading-8'
									)}
								>
									{tier.name}
								</h3>
								{tier.mostPopular ? (
									<p className="rounded-full bg-[#ff6545]/10 px-2.5 py-1 text-xs font-semibold leading-5 text-[#ff6545]">
										Most popular
									</p>
								) : null}
							</div>
							<p className="mt-4 text-sm leading-6 text-gray-600">
								{tier.description}
							</p>
							<p className="mt-6 flex items-baseline gap-x-1">
								<span className="text-4xl font-bold tracking-tight text-gray-900">
									{tier.price[frequency.value]}
								</span>
								<span className="text-sm font-semibold leading-6 text-gray-600">
									{frequency.priceSuffix}
								</span>
							</p>
							<p className={''}>Billed {isAnnually ? 'annually' : 'monthly'}</p>
							<Link
								href={tier.href}
								aria-describedby={tier.id}
								className={classNames(
									tier.mostPopular
										? 'bg-[#ff6545] text-white shadow-sm hover:bg-[#e05d45]'
										: 'text-[#ff6545] ring-1 ring-inset ring-[#ff6545]/20 hover:ring-[#e05d45]/30',
									'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6545]'
								)}
							>
								{tier.buttonText}
							</Link>
							<div className={'mt-2 flex h-[18px] items-center'}>
								{isAnnually ? (
									<span className="text-xs text-gray-500">
										<span className={'font-bold'}>20% cheaper</span> than
										monthly
									</span>
								) : (
									<button
										className={'m-0 flex gap-1 p-0'}
										onClick={() => setFrequency(frequencies[1])}
									>
										<span className="text-xs text-gray-500">
											Get <span className={'font-bold'}>20% off</span> with
											an&nbsp;<span className={'font-bold'}>annual</span>
											&nbsp;subscription
										</span>
										<div className={'flex h-full items-center'}>
											{/*	Link icon*/}
											<ArrowUpRightIcon className={'h-3 w-3 text-gray-600'} />
										</div>
									</button>
								)}
							</div>
							<ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10">
								{tier.features.map(feature => (
									<li key={feature} className="flex gap-x-3">
										<CheckIcon
											className="h-6 w-5 flex-none text-[#ff6545]"
											aria-hidden="true"
										/>
										{feature}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
