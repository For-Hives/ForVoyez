import Link from 'next/link'

export function CtaComponent() {
	return (
		<div
			className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8"
			data-testid="cta-section"
		>
			<div className="mx-auto max-w-2xl text-center">
				<h2
					className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
					data-testid="cta-title"
				>
					Boost your SEO with AI-powered image metadata.
					<br />
					Start optimizing your images today!
				</h2>
				<p
					className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600"
					data-testid="cta-description"
				>
					Automatically generate SEO-friendly alt texts, titles, and captions
					for your images. Save time and improve your search engine rankings
					with our easy-to-use API.
				</p>
				<div className="mt-10 flex items-center justify-center gap-x-6">
					<Link
						className="bg-forvoyez_orange-500 focus-visible:outline-forvoyez_orange-500 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#e05d45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
						data-testid="cta-generate-link"
						href="/app"
					>
						Generate Metadata Now
					</Link>
					<Link
						className="text-sm leading-6 font-semibold text-slate-900"
						data-testid="cta-learn-more-link"
						href="https://doc.forvoyez.com/"
					>
						Learn more <span aria-hidden="true">→</span>
					</Link>
				</div>
			</div>
		</div>
	)
}
