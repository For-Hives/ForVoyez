'use client'
import {
	ArrowPathIcon,
	CloudArrowUpIcon,
	CogIcon,
	LanguageIcon,
	LockClosedIcon,
	UserGroupIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'motion/react'

const features = [
	{
		name: 'Alt text, titles, and captions',
		description:
			'Let AI draft the image descriptions you would otherwise write by hand. Review and edit them to suit your content.',
		icon: CloudArrowUpIcon,
	},
	{
		name: 'Existing images, handled in bulk',
		description: 'Select several images in your media library and generate their descriptions together.',
		icon: ArrowPathIcon,
	},
	{
		name: 'New uploads, ready for descriptions',
		description: 'Turn on automatic generation for new uploads, or generate descriptions only when you choose.',
		icon: CogIcon,
	},
	{
		name: 'Descriptions that fit your content',
		description: 'Add context in the plugin settings to guide the descriptions, then edit the results in WordPress.',
		icon: LockClosedIcon,
	},
	{
		name: 'Use your preferred language',
		description: 'Choose a language in the plugin settings so generated descriptions fit the language of your website.',
		icon: LanguageIcon,
	},
	{
		name: 'Your familiar WordPress dashboard',
		description: 'Manage your image descriptions where you already manage your website. No code to write.',
		icon: UserGroupIcon,
	},
]

export function FeatureHighlightsComponent() {
	return (
		<div className="py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-2xl lg:text-center">
					<h2 className="text-forvoyez_orange-500 text-base leading-7 font-semibold">Built for everyday publishing</h2>
					<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
						Take care of your image descriptions in WordPress
					</p>
					<p className="mt-6 text-lg leading-8 text-gray-600">
						Use AI to draft descriptions, process existing images, and keep new uploads from piling up.
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
								<dt className="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-900">
									<feature.icon aria-hidden="true" className="text-forvoyez_orange-500 h-5 w-5 flex-none" />
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
