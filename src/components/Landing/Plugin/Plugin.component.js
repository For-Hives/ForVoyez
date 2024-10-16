import { ScissorsIcon } from '@heroicons/react/24/outline'

export function PluginComponent() {
	return (
		<section className="bg-gray-50 py-16 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-base font-semibold leading-7 text-forvoyez_orange-500">
						WordPress Integration
					</h2>
					<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
						Seamless Plugin for WordPress
					</p>
					<p className="mt-6 text-lg leading-8 text-slate-600">
						Integrate our API directly into WordPress with just a few clicks. No
						code required!
					</p>
				</div>
				<div className="mt-10 grid max-w-2xl grid-cols-1 gap-16 sm:mt-20 lg:max-w-none lg:grid-cols-2">
					<div className="relative flex flex-col items-start justify-start rounded-lg bg-white p-6 shadow-lg">
						<ScissorsIcon
							aria-hidden="true"
							className="h-8 w-8 text-forvoyez_orange-500"
						/>
						<h3 className="mt-4 text-xl font-semibold text-slate-900">
							Easy to Install
						</h3>
						<p className="mt-2 text-slate-600">
							Our plugin is easy to install and configure within your WordPress
							dashboard.
						</p>
					</div>
					<div className="relative flex flex-col items-start justify-start rounded-lg bg-white p-6 shadow-lg">
						<ScissorsIcon
							aria-hidden="true"
							className="h-8 w-8 text-forvoyez_orange-500"
						/>
						<h3 className="mt-4 text-xl font-semibold text-slate-900">
							Full API Integration
						</h3>
						<p className="mt-2 text-slate-600">
							Access the full power of our API directly through WordPress,
							automating metadata generation effortlessly.
						</p>
					</div>
				</div>
				<div className="mt-10 text-center">
					<a
						className="inline-block rounded-md bg-forvoyez_orange-500 px-6 py-3 text-sm text-white shadow-sm hover:bg-forvoyez_orange-600"
						href="/plugins"
					>
						Learn more about the plugin
					</a>
				</div>
			</div>
		</section>
	)
}
