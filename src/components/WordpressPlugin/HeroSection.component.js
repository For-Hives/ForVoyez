'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export function HeroSectionComponent() {
	return (
		<section className="relative isolate flex h-full min-h-0 flex-col items-center justify-center md:min-h-[80vh] lg:min-h-[90vh] xl:min-h-[95vh]">
			<svg
				aria-hidden="true"
				className="absolute inset-x-0 top-0 -z-10 h-[64rem] w-full stroke-slate-200 [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)]"
			>
				<defs>
					<pattern
						height={200}
						id="1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84"
						patternUnits="userSpaceOnUse"
						width={200}
						x="50%"
						y={-1}
					>
						<path d="M.5 200V.5H200" fill="none" />
					</pattern>
				</defs>
				<svg className="overflow-visible fill-slate-50" x="50%" y={-1}>
					<path
						d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
						strokeWidth={0}
					/>
				</svg>
				<rect
					fill="url(#1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84)"
					height="100%"
					strokeWidth={0}
					width="100%"
				/>
			</svg>
			<div className="overflow-hidden">
				<div className="mx-auto max-w-7xl px-6 pt-36 pb-32 sm:pt-60 lg:px-8 lg:pt-32">
					<div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className="relative w-full max-w-xl lg:shrink-0 xl:max-w-2xl"
							initial={{ opacity: 0, y: 20 }}
							transition={{ duration: 0.5 }}
						>
							<h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
								Automate Alt Text for WordPress Images
							</h1>
							<p className="mt-6 text-lg leading-8 text-slate-600 sm:max-w-md lg:max-w-none">
								Boost your SEO and accessibility with AI-powered image
								descriptions. Our WordPress plugin generates high-quality alt
								text, titles, and captions automatically.
							</p>
							<div className="mt-10 flex items-center gap-x-6">
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Link
										className="bg-forvoyez_orange-500 hover:bg-forvoyez_orange-600 focus-visible:outline-forvoyez_orange-600 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
										href="https://wordpress.org/plugins/auto-alt-text-for-images/"
									>
										Download Now
									</Link>
								</motion.div>
								<Link
									className="text-sm leading-6 font-semibold text-slate-900"
									href="#how-it-works"
								>
									Learn more <span aria-hidden="true">→</span>
								</Link>
							</div>
						</motion.div>
						<motion.div
							animate={{ opacity: 1, scale: 1 }}
							className="relative mt-20 flex w-full max-w-xl shrink-0 md:mt-0 xl:max-w-2xl"
							initial={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<Image
								alt="ForVoyez WordPress plugin interface screenshot showing the image optimization dashboard"
								className="rounded-xl object-cover"
								height={500}
								src={'/images/wordpress-plugin/forvoyez_wordpress.png'}
								width={500}
							/>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	)
}
