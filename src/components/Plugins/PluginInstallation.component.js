export function PluginInstallationComponent() {
	return (
		<section className="bg-gray-50 py-16 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<h2 className="text-base font-semibold leading-7 text-forvoyez_orange-500">
					Easy Installation Guide
				</h2>
				<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
					Get Started in Just a Few Steps
				</p>
				<div className="mt-10 grid max-w-2xl grid-cols-1 gap-16 lg:max-w-none lg:grid-cols-2">
					<div>
						<h3 className="text-xl font-semibold text-slate-900">
							1. Install the Plugin
						</h3>
						<p className="mt-4 text-slate-600">
							Head over to the WordPress Plugin Directory, search for
							&apos;Forvoyez API Plugin&apos;, and click Install.
						</p>
					</div>
					<div>
						<h3 className="text-xl font-semibold text-slate-900">
							2. Configure the Settings
						</h3>
						<p className="mt-4 text-slate-600">
							Once installed, navigate to the plugin settings and enter your API
							key. Customize the settings to your needs.
						</p>
					</div>
				</div>
				<div className="mt-10 text-center">
					<a
						className="inline-block rounded-md bg-forvoyez_orange-500 px-6 py-3 text-sm text-white shadow-sm hover:bg-forvoyez_orange-600"
						href="https://wordpress.org/plugins/auto-alt-text-for-images/"
					>
						Download Plugin
					</a>
				</div>
			</div>
		</section>
	)
}
