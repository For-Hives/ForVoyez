'use client'
import { useState } from 'react'

import { ImageDemoBottomMobileComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoBottomMobileComponent'
import { ImageDemoTopMobileComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoTopMobileComponent'
import { TextDemoBottomMobileComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/TextDemoBottomMobileComponent'
import { TextDemoTopMobileComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/TextDemoTopMobileComponent'

export function AnimateSideHeroMobileComponent() {
	const [textInButton, setTextInButton] = useState('Generate Now!')

	return (
		<div className="relative mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
			{/* View mobile */}
			<div className="mr-auto block w-44 flex-none space-y-8 sm:mr-0 sm:hidden sm:pt-52 lg:pt-36">
				<ImageDemoTopMobileComponent />
				<ImageDemoBottomMobileComponent />
			</div>
			<div className="block w-44 flex-none space-y-8 pt-32 sm:hidden sm:pt-0">
				<TextDemoTopMobileComponent />
				<TextDemoBottomMobileComponent />
			</div>
		</div>
	)
}
