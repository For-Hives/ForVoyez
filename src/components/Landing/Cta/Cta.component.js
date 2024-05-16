import Link from 'next/link'

export function CtaComponent() {
	return (
		<div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
			<div className="mx-auto max-w-2xl text-center">
				<h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
					Boost your SEO with AI-powered image metadata.
					<br />
					Start optimizing your images today!
				</h2>
				<p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
					Automatically generate SEO-friendly alt texts, titles, and captions
					for your images. Save time and improve your search engine rankings
					with our easy-to-use API.
				</p>
				<div className="mt-10 flex items-center justify-center gap-x-6">
					<Link
						href="/app"
						className="rounded-md bg-forvoyez_orange-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#e05d45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500"
					>
						Generate Metadata Now
					</Link>
					<Link
						href="https://doc.forvoyez.com/"
						className="text-sm font-semibold leading-6 text-slate-900"
					>
						Learn more <span aria-hidden="true">→</span>
					</Link>
				</div>
			</div>
		</div>
	)
}
