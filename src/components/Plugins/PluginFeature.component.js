import { CheckCircleIcon } from '@heroicons/react/20/solid'

const pluginFeatures = [
	'No coding required',
	'Seamless integration with WordPress',
	'Automatic metadata generation for images',
	'Optimized for SEO and accessibility',
	'Batch processing for large image libraries',
	'Easy setup and full documentation',
]

export function PluginFeatureComponent() {
	return (
		<section className="py-16 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<h2 className="text-base font-semibold leading-7 text-forvoyez_orange-500">
					Why Choose Our Plugin?
				</h2>
				<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
					Unlock Powerful Image SEO Features
				</p>
				<ul className="mt-10 grid max-w-lg grid-cols-1 gap-y-6 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3">
					{pluginFeatures.map(feature => (
						<li className="flex items-start space-x-4" key={feature}>
							<CheckCircleIcon
								aria-hidden="true"
								className="h-6 w-6 text-forvoyez_orange-500"
							/>
							<span className="text-lg leading-7 text-slate-600">
								{feature}
							</span>
						</li>
					))}
				</ul>
			</div>
		</section>
	)
}
