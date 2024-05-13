'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { ImageDemoMidBottomComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoMidBottom.component'
import { ImageDemoMidTopComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoMidTop.component'
import { ImageDemoRightBottomComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoRightBottom.component'
import { ImageDemoRightTopComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoRightTop.component'

export function AnimateSideHeroMobileComponent() {
	const [textInButton, setTextInButton] = useState('Generate Now!')
	useEffect(() => {
		let animateButton = function (e) {
			e.preventDefault
			//reset animation
			e.target.classList.remove('animate')

			e.target.classList.add('animate')
			setTimeout(function () {
				e.target.classList.remove('animate')
			}, 70)
		}

		let bubblyButtons = document.getElementsByClassName('bubbly-button')

		for (var i = 0; i < bubblyButtons.length; i++) {
			bubblyButtons[i].addEventListener('click', animateButton, false)
		}

		// 	after 3.1s, trigger the click event on the button
		const timeout1 = setTimeout(() => {
			bubblyButtons[0].click()
		}, 28)

		const timeout2 = setTimeout(() => {
			setTextInButton('Analyse...')
		}, 28)

		const timeout3 = setTimeout(() => {
			setTextInButton('Done !')
		}, 70)

		// Cleanup function pour annuler les timeouts lorsque le composant est démonté
		return () => {
			clearTimeout(timeout1)
			clearTimeout(timeout2)
			clearTimeout(timeout3)
		}
	}, [])

	return (
		<div className="relative mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
			{/* View mobile */}
			<div className="mr-auto block w-44 flex-none space-y-8 sm:mr-0 sm:hidden sm:pt-52 lg:pt-36">
				<ImageDemoMidTopComponent />
				<ImageDemoMidBottomComponent />
			</div>
			<div className="block w-44 flex-none space-y-8 pt-32 sm:hidden sm:pt-0">
				<ImageDemoRightTopComponent />
				<ImageDemoRightBottomComponent />
			</div>
			<div
				className={
					'container-animation absolute left-0 top-0 flex h-full w-full items-center justify-center'
				}
			>
				<div className={'relative h-full w-full'}>
					<div
						className={'cursor cursor-animation pointer-events-none absolute'}
					>
						<Image src={'/cursor.svg'} width={35} height={35} alt={'cursor'} />
					</div>
					<div className={'absolute bottom-0 right-0'}>
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
