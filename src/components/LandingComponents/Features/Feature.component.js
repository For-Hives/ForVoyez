'use client'
import RiveComponent from '@rive-app/react-canvas'
import {
	ClockIcon,
	EyeIcon,
	FolderOpenIcon,
	MagnifyingGlassIcon,
	PuzzlePieceIcon,
	SparklesIcon,
} from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'

const features = [
	{
		name: 'Automate Metadata Input',
		description:
			'Automatically generate SEO-optimized alt texts, titles, and captions with our AI-powered tool. Save time and focus on what matters most.',
		icon: SparklesIcon,
	},
	{
		name: 'Seamless Integration in Minutes',
		description:
			'Our well-documented RESTful API allows for seamless integration with your existing applications and workflows. Start generating optimized image metadata in no time.',
		icon: PuzzlePieceIcon,
	},
	{
		name: 'Boost Your Search Engine Visibility',
		description:
			'Gain a competitive edge with our SEO-optimized image metadata. Improve your rankings, drive more organic traffic, and increase user engagement.',
		icon: MagnifyingGlassIcon,
	},
	{
		name: 'Large-Scale Metadata in a Snap',
		description:
			'Whether you have dozens, hundreds, or thousands of images, our tool can handle the job. Take advantage of our powerful batch processing to generate metadata for entire image libraries in a flash.',
		icon: FolderOpenIcon,
	},
	{
		name: 'Create Accessible Images for Everyone',
		description:
			'By generating accurate alt texts and captions for your images, our tool helps make your content accessible to a wider audience. Improve the experience for all users and show your commitment to digital inclusivity.',
		icon: EyeIcon,
	},
	{
		name: 'Free Up Your Time for What Really Counts',
		description:
			'By automating image metadata creation, our tool allows you to save valuable time and free up resources. Focus on creating quality content, innovating, and growing your business.',
		icon: ClockIcon,
	},
]

export function FeatureComponent() {
	const [isRiveLoaded, setIsRiveLoaded] = useState(false)

	useEffect(() => {
		setIsRiveLoaded(true)
	}, [])

	return (
		<div className="bg-white py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-2xl sm:text-center">
					<h2 className="text-base font-semibold leading-7 text-[#ff6545]">
						Everything you need
					</h2>
					<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
						Automate your image metadata generation
					</p>
					<p className="mt-6 text-lg leading-8 text-gray-600">
						Our AI-powered tool simplifies the process of generating
						SEO-optimized image metadata, saving you time and effort while
						boosting your online visibility.
					</p>
				</div>
			</div>
			<div className="relative overflow-hidden pt-16">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					{isRiveLoaded && (
						<RiveComponent
							src="/animation_features/landing_art_forvoyez.riv"
							className="h-full min-h-[500px] w-full min-w-[5vw]"
							autoPlay={true}
							stateMachines={'State Machine 1'}
						/>
					)}
					<div className="relative" aria-hidden="true">
						<div className="absolute -inset-x-20 bottom-0 pt-[7%]" />
					</div>
				</div>
			</div>
			<div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
				<dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
					{features.map(feature => (
						<div key={feature.name} className="relative pl-9">
							<dt className="inline font-semibold text-gray-900">
								<feature.icon
									className="absolute left-1 top-1 h-5 w-5 text-[#ff6545]"
									aria-hidden="true"
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
	)
}
