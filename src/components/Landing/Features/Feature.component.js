import {
	ClockIcon,
	EyeIcon,
	FolderOpenIcon,
	MagnifyingGlassIcon,
	PuzzlePieceIcon,
	SparklesIcon,
} from '@heroicons/react/20/solid'
import { FeatureAnimation } from '@/components/Landing/Features/FeatureAnimation.component'

const features = [
	{
		name: 'Write image descriptions for you',
		description:
			'Generate alt text, titles, and captions for your WordPress images, instead of filling in every field by hand.',
		icon: SparklesIcon,
	},
	{
		name: 'Work inside WordPress',
		description:
			'Install the plugin, connect your ForVoyez account, and manage image descriptions from your familiar WordPress dashboard.',
		icon: PuzzlePieceIcon,
	},
	{
		name: 'Give search engines useful context',
		description:
			'Add descriptive text that helps search engines understand what your images show, alongside the rest of your SEO work.',
		icon: MagnifyingGlassIcon,
	},
	{
		name: 'Catch up on your media library',
		description:
			'Select existing images and generate their descriptions in bulk. Tackle the images you have been putting off, without opening each one.',
		icon: FolderOpenIcon,
	},
	{
		name: 'Help visitors understand your images',
		description:
			'Alt text describes images for people using screen readers. Review the generated text so it fits the image and its purpose on your page.',
		icon: EyeIcon,
	},
	{
		name: 'Spend more time on your content',
		description:
			'Enable automatic generation for new uploads, so image descriptions become part of your publishing routine.',
		icon: ClockIcon,
	},
]

export function FeatureComponent() {
	return (
		<div className="py-16 sm:py-32">
			<div className="relative mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
					<div className="lg:pt-4 lg:pr-8">
						<div className="lg:max-w-lg" id={'features'}>
							<h2 className="text-forvoyez_orange-500 text-base leading-7 font-semibold">
								Made for your WordPress media library
							</h2>
							<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
								Less time writing alt text. More time publishing.
							</p>
							<p className="mt-6 text-lg leading-8 text-slate-600">
								For your blog, business website, or online shop: take care of image descriptions directly in WordPress,
								with AI to help with the repetitive work.
							</p>
							<dl className="mt-16 max-w-xl space-y-12 text-base leading-7 text-slate-600 lg:max-w-none">
								{features.map(feature => (
									<div className="relative pl-9" key={feature.name}>
										<dt className="inline font-semibold text-slate-900">
											<feature.icon
												aria-hidden="true"
												className="text-forvoyez_orange-500 absolute top-1 left-1 h-5 w-5"
											/>
											{feature.name}
										</dt>
										<br />
										<dd className="inline">{feature.description}</dd>
									</div>
								))}
							</dl>
						</div>
					</div>
					<FeatureAnimation />
				</div>
			</div>
		</div>
	)
}
