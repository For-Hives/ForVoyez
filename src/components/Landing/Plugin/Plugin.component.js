import {
	ChartBarIcon,
	CloudArrowUpIcon,
	CogIcon,
	CubeTransparentIcon,
	LanguageIcon,
	UserGroupIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

const PLUGIN_FEATURES = [
	{
		description:
			'Our advanced AI technology automatically creates high-quality, SEO-friendly alt text, titles, and captions for your images, saving you hours of manual work.',
		name: 'AI-powered Generation',
		icon: CloudArrowUpIcon,
	},
	{
		description:
			'Effortlessly optimize your entire image library in one go. Process hundreds or thousands of images with just a few clicks.',
		name: 'Bulk Processing',
		icon: CogIcon,
	},
	{
		description:
			'Set it and forget it! Our plugin automatically generates metadata for newly uploaded images, ensuring your content is always optimized.',
		name: 'Auto New Upload Processing',
		icon: ChartBarIcon,
	},
	{
		description:
			'Tailor the generated metadata to your needs with customizable output formats. Control how your alt text, titles, and captions are structured.',
		name: 'Customizable Output',
		icon: CubeTransparentIcon,
	},
	{
		description:
			'Reach a global audience with our multi-language support. Generate metadata in various languages to improve your international SEO.',
		name: 'Multi-language Support',
		icon: LanguageIcon,
	},
	{
		description:
			'Intuitive WordPress admin interface makes it easy for anyone to use, regardless of technical expertise. Boost your SEO with just a few clicks.',
		name: 'User-friendly Interface',
		icon: UserGroupIcon,
	},
]

export function PluginComponent() {
	return (
		<div className="py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-2xl lg:text-center">
					<h2 className="text-base font-semibold leading-7 text-forvoyez_orange-500">
						WordPress Plugin
					</h2>
					<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
						ForVoyez Auto Alt Text for Images
					</p>
					<p className="mt-6 text-lg leading-8 text-gray-600">
						Enhance your website's accessibility and SEO effortlessly. Our
						powerful WordPress plugin leverages AI technology to automatically
						generate high-quality metadata for your images.
					</p>
				</div>
				<div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
					<dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
						{PLUGIN_FEATURES.map(feature => (
							<div className="flex flex-col" key={feature.name}>
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
							</div>
						))}
					</dl>
				</div>
				<div className="mt-10 flex justify-center">
					<Link
						className="rounded-md bg-forvoyez_orange-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forvoyez_orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500"
						href="/plugins"
					>
						Get Started in your WordPress website
					</Link>
				</div>
			</div>
		</div>
	)
}
