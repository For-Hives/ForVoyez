import Image from 'next/image'
import Link from 'next/link'

export default function notFound() {
	return (
		<>
			<div
				className={
					'pointer-events-none fixed left-0 top-0 z-10 h-screen w-screen'
				}
			>
				<Image
					alt={'404 image'}
					className={'hidden object-cover object-right lg:block'}
					fill={true}
					src={'/404/404.webp'}
				/>
				<Image
					alt={'404 image mobile'}
					className={'block object-cover lg:hidden'}
					fill={true}
					src={'/404/404_mobile.webp'}
				/>
			</div>
			<div className="z-50 mx-auto flex h-screen w-1/2 max-w-7xl flex-col items-start justify-start py-40 lg:justify-center lg:py-16">
				<p className="text-sm font-semibold text-slate-900">404</p>
				<h1 className="mt-2 text-2xl font-bold text-slate-900">
					Page not found
				</h1>
				<p className="mt-2 text-base text-slate-600">
					Sorry, we couldn’t find the page you’re looking for.
				</p>
				<Link arrow="right" className="mt-8 underline" href="/app">
					→ Back to docs
				</Link>
			</div>
		</>
	)
}
