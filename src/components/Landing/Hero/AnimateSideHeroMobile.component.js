'use client'
import { useMemo } from 'react'

import { ImageDemoBottomMobileComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoBottomMobileComponent'
import { TextDemoBottomMobileComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/TextDemoBottomMobileComponent'
import { ImageDemoTopMobileComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/ImageDemoTopMobileComponent'
import { TextDemoTopMobileComponent } from '@/components/Landing/Hero/ImageDemoComponents/mobile/TextDemoTopMobileComponent'

export function AnimateSideHeroMobileComponent() {
	const imageComponents = useMemo(
		() => (
			<>
				<ImageDemoTopMobileComponent />
				<ImageDemoBottomMobileComponent />
			</>
		),
		[]
	)

	const textComponents = useMemo(
		() => (
			<>
				<TextDemoTopMobileComponent />
				<TextDemoBottomMobileComponent />
			</>
		),
		[]
	)

	return (
		<div className="relative mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
			{/* View mobile */}
			<div className="mr-auto block w-44 flex-none space-y-8 sm:mr-0 sm:hidden sm:pt-52 lg:pt-36">
				{imageComponents}
			</div>
			<div className="block w-44 flex-none space-y-8 pt-32 sm:hidden sm:pt-0">
				{textComponents}
			</div>
		</div>
	)
}
