import {
	ChartBarIcon,
	CloudArrowUpIcon,
	CogIcon,
	CubeTransparentIcon,
	LanguageIcon,
	UserGroupIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Transition } from '@/components/Transitions/Transition.component'

const PLUGIN_FEATURES = [
	{
		name: 'Alt text, titles, and captions',
		description:
			'Let AI draft the image descriptions you would otherwise write by hand. Review and edit them to suit your content.',
		icon: CloudArrowUpIcon,
	},
	{
		name: 'Existing images, handled in bulk',
		description: 'Select several images in your media library and generate their descriptions together.',
		icon: CogIcon,
	},
	{
		name: 'New uploads, ready for descriptions',
		description: 'Turn on automatic generation for new uploads, or generate descriptions only when you choose.',
		icon: ChartBarIcon,
	},
	{
		name: 'Descriptions that fit your content',
		description: 'Add context in the plugin settings to guide the descriptions, then edit the results in WordPress.',
		icon: CubeTransparentIcon,
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

export function PluginComponent() {
	return (
		<div className="py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-2xl lg:text-center">
					<h2 className="text-forvoyez_orange-500 text-base leading-7 font-semibold">WordPress Plugin</h2>
					<Transition name="wordpress-plugin-title">
						<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
							A simpler routine for your WordPress images
						</p>
					</Transition>
					<Transition name="wordpress-plugin-description">
						<p className="mt-6 text-lg leading-8 text-gray-600">
							Generate descriptions for existing images and new uploads, all from your media library.
						</p>
					</Transition>
				</div>
				<div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
					<dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
						{PLUGIN_FEATURES.map(feature => (
							<div className="flex flex-col" key={feature.name}>
								<dt className="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-900">
									<feature.icon aria-hidden="true" className="text-forvoyez_orange-500 h-5 w-5 flex-none" />
									{feature.name}
								</dt>
								<dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
									<p className="flex-auto">{feature.description}</p>
								</dd>
							</div>
						))}
					</dl>
				</div>
				<div className="mt-16 flex justify-center pt-8">
					<Link
						className="bg-forvoyez_orange-500 hover:bg-forvoyez_orange-600 focus-visible:outline-forvoyez_orange-500 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
						href="/wordpress-plugin"
					>
						Explore the WordPress plugin
					</Link>
				</div>
			</div>
		</div>
	)
}
