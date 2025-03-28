'use client'
import { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'

import { ImageDemoRightBottomComponent } from '@/components/Landing/Hero/ImageDemoComponents/desktop/ImageDemoRightBottom.component'
import { ImageDemoMidBottomComponent } from '@/components/Landing/Hero/ImageDemoComponents/desktop/ImageDemoMidBottom.component'
import { ImageDemoRightTopComponent } from '@/components/Landing/Hero/ImageDemoComponents/desktop/ImageDemoRightTop.component'
import { ImageDemoMidTopComponent } from '@/components/Landing/Hero/ImageDemoComponents/desktop/ImageDemoMidTop.component'
import { ImageDemoLeftComponent } from '@/components/Landing/Hero/ImageDemoComponents/desktop/ImageDemoLeft.component'

export function AnimateSideHeroComponent() {
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

		for (let i = 0; i < bubblyButtons.length; i++) {
			bubblyButtons[i].addEventListener('click', animateButton, false)
		}

		// 	after 3.1s, trigger the click event on the button
		const timeout1 = setTimeout(() => {
			bubblyButtons[0].click()
		}, 2800)

		const timeout2 = setTimeout(() => {
			setTextInButton('Analyse...')
		}, 2800)

		const timeout3 = setTimeout(() => {
			setTextInButton('Done !')
		}, 7000)

		// Cleanup function pour annuler les timeouts lorsque le composant est démonté
		return () => {
			clearTimeout(timeout1)
			clearTimeout(timeout2)
			clearTimeout(timeout3)
		}
	}, [])

	const memoizedImageDemoLeftComponent = useMemo(
		() => <ImageDemoLeftComponent />,
		[]
	)
	const memoizedImageDemoMidTopComponent = useMemo(
		() => <ImageDemoMidTopComponent />,
		[]
	)
	const memoizedImageDemoMidBottomComponent = useMemo(
		() => <ImageDemoMidBottomComponent />,
		[]
	)
	const memoizedImageDemoRightTopComponent = useMemo(
		() => <ImageDemoRightTopComponent />,
		[]
	)
	const memoizedImageDemoRightBottomComponent = useMemo(
		() => <ImageDemoRightBottomComponent />,
		[]
	)

	return (
		<div className="relative mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
			{/* View sm + (all except mobile) */}
			<div className="ml-auto hidden w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:block sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
				{memoizedImageDemoLeftComponent}
			</div>
			<div className="mr-auto hidden w-44 flex-none space-y-8 sm:mr-0 sm:block sm:pt-52 lg:pt-36">
				{memoizedImageDemoMidTopComponent}
				{memoizedImageDemoMidBottomComponent}
			</div>
			<div className="hidden w-44 flex-none space-y-8 pt-32 sm:block sm:pt-0">
				{memoizedImageDemoRightTopComponent}
				{memoizedImageDemoRightBottomComponent}
			</div>
			{/* View mobile */}
			<div className="mr-auto block w-44 flex-none space-y-8 sm:mr-0 sm:hidden sm:pt-52 lg:pt-36">
				{memoizedImageDemoMidTopComponent}
				{memoizedImageDemoMidBottomComponent}
			</div>
			<div className="block w-44 flex-none space-y-8 pt-32 sm:hidden sm:pt-0">
				{memoizedImageDemoRightTopComponent}
				{memoizedImageDemoRightBottomComponent}
			</div>
			<div
				className={
					'container-animation absolute top-0 left-0 flex h-full w-full items-center justify-center'
				}
			>
				<div
					className={
						'relative h-full w-full lg:-translate-x-1/3 xl:translate-x-0'
					}
				>
					<div
						className={'cursor cursor-animation pointer-events-none absolute'}
					>
						<Image alt={'cursor'} height={35} src={'/cursor.svg'} width={35} />
					</div>
					<div className={'absolute right-0 bottom-0'}>
						<div>
							<div className={'relative'}>
								<button className={'bubbly-button font-bold text-slate-950'}>
									{textInButton}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
