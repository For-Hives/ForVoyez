import Image from 'next/image'
import Link from 'next/link'

import { HeroPatternAppComponent } from '@/components/App/HeroPatternApp.component'

export default function NotFound() {
	return (
		<>
			<div
				className={
					'pointer-events-none fixed left-0 top-0 z-10 h-screen w-screen'
				}
			>
				<Image
					src={'/404/404.webp'}
					alt={'404 image'}
					fill={true}
					className={'object-cover'}
				/>
			</div>
			<div className="z-50 mx-auto flex h-screen w-1/2 max-w-7xl flex-col items-start justify-center py-16">
				<p className="text-sm font-semibold text-slate-900">404</p>
				<h1 className="mt-2 text-2xl font-bold text-slate-900">
					Page not found
				</h1>
				<p className="mt-2 text-base text-slate-600">
					Sorry, we couldn’t find the page you’re looking for.
				</p>
				<Link href="/app" arrow="right" className="mt-8 underline">
					→ Back to docs
				</Link>
			</div>
		</>
	)
}
