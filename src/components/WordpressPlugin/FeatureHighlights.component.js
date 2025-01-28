'use client'
import {
	ArrowPathIcon,
	CloudArrowUpIcon,
	CogIcon,
	LanguageIcon,
	LockClosedIcon,
	UserGroupIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const features = [
	{
		description:
			'Our advanced AI technology automatically creates high-quality, SEO-friendly alt text, titles, and captions for your images.',
		name: 'AI-powered Generation',
		icon: CloudArrowUpIcon,
	},
	{
		description:
			'Optimize your entire image library in one go. Process hundreds or thousands of images with just a few clicks.',
		name: 'Bulk Processing',
		icon: ArrowPathIcon,
	},
	{
		description:
			'Automatically generate metadata for newly uploaded images, ensuring your content is always optimized.',
		name: 'Auto New Upload Processing',
		icon: CogIcon,
	},
	{
		description:
			'Tailor the generated metadata to your needs with customizable output formats.',
		name: 'Customizable Output',
		icon: LockClosedIcon,
	},
	{
		description:
			'Generate metadata in various languages to improve your international SEO.',
		name: 'Multi-language Support',
		icon: LanguageIcon,
	},
	{
		description:
			'Intuitive WordPress admin interface makes it easy for anyone to use, regardless of technical expertise.',
		name: 'User-friendly Interface',
		icon: UserGroupIcon,
	},
]

export function FeatureHighlightsComponent() {
	return (
		<div className="py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-2xl lg:text-center">
					<h2 className="text-base font-semibold leading-7 text-forvoyez_orange-500">
						Feature-rich Plugin
					</h2>
					<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
						Everything you need to optimize your WordPress images
					</p>
					<p className="mt-6 text-lg leading-8 text-gray-600">
						{`Our plugin offers a comprehensive set of features to streamline your
							image optimization workflow and boost your website's SEO and
							accessibility.`}
					</p>
				</div>
				<div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
					<dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
						{features.map((feature, index) => (
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								className="flex flex-col"
								initial={{ opacity: 0, y: 20 }}
								key={feature.name}
								transition={{ delay: index * 0.1, duration: 0.5 }}
							>
								<dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
									<feature.icon
										aria-hidden="true"
										className="h-5 w-5 flex-none text-forvoyez_orange-500"
									/>
									{feature.name}
								</dt>
								<dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
									<p className="flex-auto">{feature.description}</p>
								</dd>
							</motion.div>
						))}
					</dl>
				</div>
			</div>
		</div>
	)
}
