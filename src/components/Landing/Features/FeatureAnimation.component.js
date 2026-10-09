'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const RiveComponent = dynamic(() => import('@rive-app/react-canvas'), { ssr: false })

export function FeatureAnimation() {
	const container = useRef(null)
	const [visible, setVisible] = useState(false)
	const [reducedMotion, setReducedMotion] = useState(false)

	useEffect(() => {
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
		const updateMotion = () => setReducedMotion(preference.matches)
		updateMotion()
		preference.addEventListener('change', updateMotion)
		if (!window.IntersectionObserver) {
			setVisible(true)
			return () => preference.removeEventListener('change', updateMotion)
		}
		const observer = new IntersectionObserver(
			entries => {
				if (entries.some(entry => entry.isIntersecting)) {
					setVisible(true)
					observer.disconnect()
				}
			},
			{ rootMargin: '200px' }
		)
		observer.observe(container.current)
		return () => {
			observer.disconnect()
			preference.removeEventListener('change', updateMotion)
		}
	}, [])

	return (
		<div
			aria-hidden="true"
			className="sticky top-[25vh] flex h-[50vh] w-full items-center justify-center"
			ref={container}
		>
			{visible && (
				<RiveComponent
					autoplay={!reducedMotion}
					className="h-[50vh] w-[50vh]"
					data-testid="rive-component"
					src="/animation_features/landing_art_forvoyez.riv"
					stateMachines="State Machine 1"
				/>
			)}
		</div>
	)
}
