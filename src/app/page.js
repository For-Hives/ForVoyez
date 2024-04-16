'use client'
import Link from 'next/link'
import Image from 'next/image'
import { NavbarComponent } from '@/components/Navbar.component'
import { ImageDemoLeftComponent } from '@/components/ImageDemoComponents/ImageDemoLeft.component'
import { ImageDemoMidTopComponent } from '@/components/ImageDemoComponents/ImageDemoMidTop.component'
import { ImageDemoMidBottomComponent } from '@/components/ImageDemoComponents/ImageDemoMidBottom.component'
import { ImageDemoRightTopComponent } from '@/components/ImageDemoComponents/ImageDemoRightTop.component'
import { ImageDemoRightBottomComponent } from '@/components/ImageDemoComponents/ImageDemoRightBottom.component'
import { useEffect, useState } from 'react'

export default function Home() {
	const [textInButton, setTextInButton] = useState('Generate Now!')
	useEffect(() => {
		let animateButton = function (e) {
			e.preventDefault
			//reset animation
			e.target.classList.remove('animate')

			e.target.classList.add('animate')
			setTimeout(function () {
				e.target.classList.remove('animate')
			}, 700)
		}

		let bubblyButtons = document.getElementsByClassName('bubbly-button')

		for (var i = 0; i < bubblyButtons.length; i++) {
			bubblyButtons[i].addEventListener('click', animateButton, false)
		}

		// 	after 3.1s, trigger the click event on the button
		setTimeout(() => {
			bubblyButtons[0].click()
		}, 2800)

		setTimeout(() => {
			setTextInButton('Analyse...')
		}, 2800)

		setTimeout(() => {
			setTextInButton('Done !')
		}, 7000)
	}, [])

	return (
		<div className="bg-white">
			<NavbarComponent />
			<main>
				<div className="relative isolate">
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
											href="#"
											className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
										>
											Get started
										</Link>
									</div>
								</div>
								<div className="relative mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
									<div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
										<ImageDemoLeftComponent />
									</div>
									<div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
										<ImageDemoMidTopComponent />
										<ImageDemoMidBottomComponent />
									</div>
									<div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
										<ImageDemoRightTopComponent />
										<ImageDemoRightBottomComponent />
									</div>
									<div
										className={
											'absolute left-0 top-0 flex h-full w-full items-center justify-center'
										}
									>
										<div className={'relative h-full w-full'}>
											<div
												className={
													'cursor cursor-animation pointer-events-none pointer-events-none absolute'
												}
											>
												<Image
													src={'/cursor.svg'}
													width={35}
													height={35}
													alt={'cursor'}
												/>
											</div>
											<div className={'absolute bottom-0 right-0'}>
												<div>
													<div className={'relative'}>
														<button
															className={
																'bubbly-button font-bold text-slate-950'
															}
														>
															{textInButton}
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}
