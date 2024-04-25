'use client'
import { useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'

const frequencies = [
	{ value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
	{ value: 'annually', label: 'Annually', priceSuffix: '/year' },
]
const tiers = [
	{
		name: 'Starter',
		id: 'tier-starter',
		href: '#',
		price: { monthly: '2.99€', annually: '29.90€' },
		description: 'Perfect for individual developers and small projects.',
		features: [
			'100 credits/month',
			'Basic metadata generation',
			'Community support',
		],
		mostPopular: false,
	},
	{
		name: 'Pro',
		id: 'tier-pro',
		href: '#',
		price: { monthly: '$149', annually: '$1490' },
		description: 'Best for growing teams and medium-sized applications.',
		features: [
			'10,000 credits/month',
			'Advanced metadata generation',
			'Priority support',
			'Dedicated account manager',
		],
		mostPopular: true,
	},
	{
		name: 'Enterprise',
		id: 'tier-enterprise',
		href: '#',
		price: { monthly: 'Custom', annually: 'Custom' },
		description:
			'Tailored for large-scale deployments and complex requirements.',
		features: [
			'Unlimited credits',
			'Advanced metadata generation',
			'24/7 dedicated support',
			'Custom SLAs',
			'Volume discounts',
			'On-premise option',
		],
		mostPopular: false,
	},
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export function PricingComponent() {
	const [frequency, setFrequency] = useState(frequencies[0])

	return (
		<div className="bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="text-base font-semibold leading-7 text-[#ff6545]">
						Pricing
					</h2>
					<p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
						Flexible plans for all your needs
					</p>
				</div>
				<p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
					Choose the right plan for your usage and scale as your needs grow.
					Switch plans or cancel anytime.
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
										'cursor-pointer rounded-full px-2.5 py-1'
									)
								}
							>
								<span>{option.label}</span>
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
							<a
								href={tier.href}
								aria-describedby={tier.id}
								className={classNames(
									tier.mostPopular
										? 'bg-[#ff6545] text-white shadow-sm hover:bg-[#e05d45]'
										: 'text-[#ff6545] ring-1 ring-inset ring-[#ff6545]/20 hover:ring-[#e05d45]/30',
									'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6545]'
								)}
							>
								{tier.name === 'Starter' ? 'Get started' : 'Upgrade'}
							</a>
							<ul
								role="list"
								className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10"
							>
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
