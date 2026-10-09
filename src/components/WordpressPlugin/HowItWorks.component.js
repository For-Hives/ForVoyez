'use client'
import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/24/outline'
import { motion } from 'motion/react'
import Link from 'next/link'

const features = [
	{
		name: '1. Install the plugin',
		description:
			'In WordPress, open Plugins \u2192 Add New and search for Auto Alt Text for Images. Install and activate it.',
		icon: CloudArrowUpIcon,
	},
	{
		name: '2. Connect your ForVoyez account',
		description:
			'Create an account, choose a plan, and copy your API key into the plugin settings. This key connects the plugin to your account; no coding is needed.',
		icon: LockClosedIcon,
	},
	{
		name: '3. Generate and review your descriptions',
		description:
			'Select images in your media library to generate descriptions in bulk. Review the text, edit it if needed, and enable automatic generation for future uploads if you want.',
		icon: ServerIcon,
	},
]

export function HowItWorksComponent() {
	return (
		<div className="overflow-hidden bg-white py-24 sm:py-32" id="how-it-works">
			<div className="mx-auto max-w-7xl md:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:grid-cols-2 lg:items-start">
					<div className="px-6 lg:px-0 lg:pt-4 lg:pr-4">
						<div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-lg">
							<h2 className="text-forvoyez_orange-500 text-base leading-7 font-semibold">
								From installation to your first descriptions
							</h2>
							<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
								Three steps. No code to write.
							</p>
							<p className="mt-6 text-lg leading-8 text-gray-600">
								The plugin is free to install. A ForVoyez account with available credits is required to generate
								descriptions.
							</p>
							<Link className="mt-4 inline-block font-semibold text-forvoyez_orange-500 underline" href="/app/tokens">
								Get your connection key →
							</Link>
							<dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
								{features.map(feature => (
									<motion.div
										animate={{ opacity: 1, x: 0 }}
										className="relative pl-9"
										initial={{ opacity: 0, x: -20 }}
										key={feature.name}
										transition={{ duration: 0.5 }}
									>
										<dt className="inline font-semibold text-gray-900">
											<feature.icon
												aria-hidden="true"
												className="text-forvoyez_orange-500 absolute top-1 left-1 h-5 w-5"
											/>
											{feature.name}
										</dt>{' '}
										<dd className="inline">{feature.description}</dd>
									</motion.div>
								))}
							</dl>
						</div>
					</div>
					<div className="h-full px-6 lg:px-0">
						<div className="bg-forvoyez_orange-500 relative isolate h-full overflow-hidden rounded-3xl px-6 pt-12 sm:mx-auto sm:max-w-2xl lg:max-w-none">
							<div
								aria-hidden="true"
								className="bg-forvoyez_orange-100 absolute -inset-y-px -left-3 -z-10 h-full w-full origin-bottom-left skew-x-[-30deg] opacity-20 ring-1 ring-white ring-inset"
							/>
							<div className="mx-auto flex h-full max-w-2xl items-center sm:mx-0 sm:max-w-none">
								<div className="aspect-video w-full">
									<iframe
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
										className="rounded-xl"
										height="100%"
										src="https://www.youtube.com/embed/tY-C1fPhCtE"
										title="ForVoyez WordPress Plugin Demo"
										width="100%"
									></iframe>
								</div>
							</div>
							<div
								aria-hidden="true"
								className="pointer-events-none absolute inset-0 ring-1 ring-black/10 ring-inset sm:rounded-3xl"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
