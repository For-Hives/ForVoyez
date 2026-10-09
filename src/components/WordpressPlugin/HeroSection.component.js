'use client'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { Transition } from '@/components/Transitions/Transition.component'

export function HeroSectionComponent() {
	return (
		<section className="relative isolate flex h-full min-h-0 flex-col items-center justify-center md:min-h-[80vh] lg:min-h-[90vh] xl:min-h-[95vh]">
			<svg
				aria-hidden="true"
				className="absolute inset-x-0 top-0 -z-10 h-[64rem] w-full [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)] stroke-slate-200"
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
				<rect fill="url(#1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84)" height="100%" strokeWidth={0} width="100%" />
			</svg>
			<div className="overflow-hidden">
				<div className="mx-auto max-w-7xl px-6 pt-36 pb-32 sm:pt-60 lg:px-8 lg:pt-32">
					<div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
						<motion.div className="relative w-full max-w-xl lg:shrink-0 xl:max-w-2xl" initial={false}>
							<Transition name="wordpress-plugin-title">
								<h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
									Image descriptions, handled right inside WordPress.
								</h1>
							</Transition>
							<Transition name="wordpress-plugin-description">
								<p className="mt-6 text-lg leading-8 text-slate-600 sm:max-w-md lg:max-w-none">
									Generate alt text, titles, and captions from your media library. Connect your ForVoyez account once,
									then describe existing images in bulk or enable generation for new uploads.
								</p>
							</Transition>
							<div className="mt-10 flex items-center gap-x-6">
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Link
										className="bg-forvoyez_orange-500 hover:bg-forvoyez_orange-600 focus-visible:outline-forvoyez_orange-600 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
										href="https://wordpress.org/plugins/auto-alt-text-for-images/"
									>
										Install the WordPress plugin
									</Link>
								</motion.div>
								<Link className="text-sm leading-6 font-semibold text-slate-900" href="#how-it-works">
									See the setup steps <span aria-hidden="true">→</span>
								</Link>
							</div>
						</motion.div>
						<motion.div className="relative mt-20 flex w-full max-w-xl shrink-0 md:mt-0 xl:max-w-2xl" initial={false}>
							<Transition name="wordpress-plugin-image">
								<Image
									alt="ForVoyez WordPress plugin interface screenshot showing the image optimization dashboard"
									className="rounded-xl object-cover"
									height={500}
									src={'/images/wordpress-plugin/forvoyez_wordpress.png'}
									width={500}
								/>
							</Transition>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	)
}
