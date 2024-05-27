'use client'
import { useEffect, useState } from 'react'

import {
	ClockIcon,
	EyeIcon,
	FolderOpenIcon,
	MagnifyingGlassIcon,
	PuzzlePieceIcon,
	SparklesIcon,
} from '@heroicons/react/20/solid'
import RiveComponent from '@rive-app/react-canvas'

const features = [
	{
		description:
			'Automatically generate SEO-optimized alt texts, titles, and captions with our AI-powered tool. Save time and focus on what matters most.',
		name: 'Automate Metadata Input',
		icon: SparklesIcon,
	},
	{
		description:
			'Our well-documented RESTful API allows for seamless integration with your existing applications and workflows. Start generating optimized image metadata in no time.',
		name: 'Seamless Integration in Minutes',
		icon: PuzzlePieceIcon,
	},
	{
		description:
			'Gain a competitive edge with our SEO-optimized image metadata. Improve your rankings, drive more organic traffic, and increase user engagement.',
		name: 'Boost Your Search Engine Visibility',
		icon: MagnifyingGlassIcon,
	},
	{
		description:
			'Whether you have dozens, hundreds, or thousands of images, our tool can handle the job. Take advantage of our powerful batch processing to generate metadata for entire image libraries in a flash.',
		name: 'Large-Scale Metadata in a Snap',
		icon: FolderOpenIcon,
	},
	{
		description:
			'By generating accurate alt texts and captions for your images, our tool helps make your content accessible to a wider audience. Improve the experience for all users and show your commitment to digital inclusivity.',
		name: 'Create Accessible Images for Everyone',
		icon: EyeIcon,
	},
	{
		description:
			'By automating image metadata creation, our tool allows you to save valuable time and free up resources. Focus on creating quality content, innovating, and growing your business.',
		name: 'Free Up Your Time for What Really Counts',
		icon: ClockIcon,
	},
]

export function FeatureComponent() {
	const [isRiveLoaded, setIsRiveLoaded] = useState(false)

	useEffect(() => {
		setIsRiveLoaded(true)
	}, [])

	return (
		<div className="py-16 sm:py-32">
			<div className="relative mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
					<div className="lg:pr-8 lg:pt-4">
						<div className="lg:max-w-lg" id={'features'}>
							<h2 className="text-base font-semibold leading-7 text-forvoyez_orange-500">
								AI-Powered Image Metadata
							</h2>
							<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
								Optimize Your Images Effortlessly
							</p>
							<p className="mt-6 text-lg leading-8 text-slate-600">
								Our AI-powered tool simplifies the process of generating
								SEO-optimized image metadata, saving you time and effort while
								boosting your online visibility.
							</p>
							<dl className="mt-16 max-w-xl space-y-12 text-base leading-7 text-slate-600 lg:max-w-none">
								{features.map(feature => (
									<div className="relative pl-9" key={feature.name}>
										<dt className="inline font-semibold text-slate-900">
											<feature.icon
												aria-hidden="true"
												className="absolute left-1 top-1 h-5 w-5 text-forvoyez_orange-500"
											/>
											{feature.name}
										</dt>
										<br />
										<dd className="inline">{feature.description}</dd>
									</div>
								))}
							</dl>
						</div>
					</div>
					<div className="sticky top-[25vh] flex h-[50vh] w-full items-center justify-center">
						{isRiveLoaded && (
							<RiveComponent
								autoPlay={true}
								className="h-[50vh] w-[50vh]"
								data-testid="rive-component"
								src="/animation_features/landing_art_forvoyez.riv"
								stateMachines={'State Machine 1'}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
