import Link from 'next/link'
import { AnimateSideHeroComponent } from '@/components/LandingComponents/Hero/AnimateSideHero.component'

export function HeroComponent() {
	return (
		<section className="relative isolate">
			<svg
				className="absolute inset-x-0 top-0 -z-10 h-[64rem] w-full stroke-gray-200 [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)]"
				aria-hidden="true"
			>
				<defs>
					<pattern
						id="1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84"
						width={200}
						height={200}
						x="50%"
						y={-1}
						patternUnits="userSpaceOnUse"
					>
						<path d="M.5 200V.5H200" fill="none" />
					</pattern>
				</defs>
				<svg x="50%" y={-1} className="overflow-visible fill-gray-50">
					<path
						d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
						strokeWidth={0}
					/>
				</svg>
				<rect
					width="100%"
					height="100%"
					strokeWidth={0}
					fill="url(#1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84)"
				/>
			</svg>
			<div
				className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
				aria-hidden="true"
			>
				<div
					className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
					style={{
						clipPath:
							'polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)',
					}}
				/>
			</div>
			<div className="overflow-hidden">
				<div className="mx-auto max-w-7xl px-6 pb-32 pt-36 sm:pt-60 lg:px-8 lg:pt-32">
					<div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
						<div className="relative w-full max-w-xl lg:shrink-0 xl:max-w-2xl">
							<h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
								Generate Image Alt Text and Meta Descriptions in Seconds.
							</h1>
							<p className="mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none">
								Our AI-powered API makes it easy for developers to optimize
								images for SEO. Save time, boost SEO, and streamline your
								workflow with our powerful API.
							</p>
							<div className="mt-10 flex items-center gap-x-6">
								<Link
									href="/dashboard"
									className="rounded-md bg-forvoyez_orange-500 px-3.5 py-2.5 text-sm text-white shadow-sm transition-all hover:bg-forvoyez_orange-600
											 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-600"
								>
									Get started
								</Link>
							</div>
						</div>
						<AnimateSideHeroComponent />
					</div>
				</div>
			</div>
		</section>
	)
}
