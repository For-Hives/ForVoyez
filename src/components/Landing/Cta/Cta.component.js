import Link from 'next/link'

export function CtaComponent() {
	return (
		<div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8" data-testid="cta-section">
			<div className="mx-auto max-w-2xl text-center">
				<h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl" data-testid="cta-title">
					Give your WordPress images a description.
					<br />
					Get back to creating content.
				</h2>
				<p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600" data-testid="cta-description">
					Install ForVoyez, connect your account, and generate alt text from your media library. The plugin is free to
					install; image generation uses the credits in your ForVoyez plan.
				</p>
				<div className="mt-10 flex items-center justify-center gap-x-6">
					<Link
						className="bg-forvoyez_orange-500 focus-visible:outline-forvoyez_orange-500 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#e05d45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
						data-testid="cta-generate-link"
						href="https://wordpress.org/plugins/auto-alt-text-for-images/"
					>
						Install the WordPress plugin
					</Link>
					<Link
						className="text-sm leading-6 font-semibold text-slate-900"
						data-testid="cta-learn-more-link"
						href="/wordpress-plugin#how-it-works"
					>
						See how it works <span aria-hidden="true">→</span>
					</Link>
				</div>
			</div>
		</div>
	)
}
