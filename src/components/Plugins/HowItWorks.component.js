'use client'
import {
	CloudArrowUpIcon,
	LockClosedIcon,
	ServerIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const features = [
	{
		description:
			'Install our plugin directly from your WordPress dashboard or upload it manually. Get started in minutes.',
		name: 'Easy Installation',
		icon: CloudArrowUpIcon,
	},
	{
		description:
			'Our AI automatically generates alt text, titles, and captions for your images as you upload them.',
		name: 'Automatic Processing',
		icon: ServerIcon,
	},
	{
		description:
			'Improve your search engine rankings with optimized image metadata that helps search engines understand your content.',
		name: 'SEO Optimization',
		icon: LockClosedIcon,
	},
]

export function HowItWorksComponent() {
	return (
		<div className="overflow-hidden bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-7xl md:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:grid-cols-2 lg:items-start">
					<div className="px-6 lg:px-0 lg:pr-4 lg:pt-4">
						<div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-lg">
							<h2 className="text-base font-semibold leading-7 text-forvoyez_orange-500">
								Streamlined Process
							</h2>
							<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
								How It Works
							</p>
							<p className="mt-6 text-lg leading-8 text-gray-600">
								Our plugin simplifies the process of optimizing your WordPress
								images for better SEO and accessibility. Here's how it works:
							</p>
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
												className="absolute left-1 top-1 h-5 w-5 text-forvoyez_orange-500"
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
						<div className="relative isolate h-full overflow-hidden rounded-3xl bg-forvoyez_orange-500 px-6 pt-12 sm:mx-auto sm:max-w-2xl lg:max-w-none">
							<div
								aria-hidden="true"
								className="absolute -inset-y-px -left-3 -z-10 h-full w-full origin-bottom-left skew-x-[-30deg] bg-forvoyez_orange-100 opacity-20 ring-1 ring-inset ring-white"
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
								className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 sm:rounded-3xl"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
