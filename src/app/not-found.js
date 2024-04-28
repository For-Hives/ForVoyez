import { HeroPatternDashboard } from '@/app/dashboard/HeroPatternDashboard'
import Link from 'next/link'

export default function NotFound() {
	return (
		<>
			<HeroPatternDashboard />
			<div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center py-16 text-center">
				<p className="text-sm font-semibold text-slate-900">404</p>
				<h1 className="mt-2 text-2xl font-bold text-slate-900">
					Page not found
				</h1>
				<p className="mt-2 text-base text-slate-600">
					Sorry, we couldn’t find the page you’re looking for.
				</p>
				<Link href="/" arrow="right" className="mt-8">
					Back to docs
				</Link>
			</div>
		</>
	)
}
