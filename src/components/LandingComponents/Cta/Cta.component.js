import Link from 'next/link'

export function CtaComponent() {
	return (
		<div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
			<div className="mx-auto max-w-2xl text-center">
				<h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
					Boost your SEO with AI-powered image metadata.
					<br />
					Start optimizing your images today!
				</h2>
				<p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
					Automatically generate SEO-friendly alt texts, titles, and captions
					for your images. Save time and improve your search engine rankings
					with our easy-to-use API.
				</p>
				<div className="mt-10 flex items-center justify-center gap-x-6">
					<Link
						href="#"
						className="rounded-md bg-[#ff6545] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#e05d45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6545]"
					>
						Generate Metadata Now
					</Link>
					<Link
						href="#"
						className="text-sm font-semibold leading-6 text-gray-900"
					>
						Learn more <span aria-hidden="true">→</span>
					</Link>
				</div>
			</div>
		</div>
	)
}
