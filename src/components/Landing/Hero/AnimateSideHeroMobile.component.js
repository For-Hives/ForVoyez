'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { ImageDemoMidBottomComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoMidBottom.component'
import { ImageDemoMidTopComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoMidTop.component'
import { ImageDemoRightBottomComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoRightBottom.component'
import { ImageDemoRightTopComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoRightTop.component'

export function AnimateSideHeroMobileComponent() {
	const [textInButton, setTextInButton] = useState('Generate Now!')

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
		</div>
	)
}
