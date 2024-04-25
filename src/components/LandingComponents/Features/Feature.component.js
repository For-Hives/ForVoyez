'use client'
import {
	ClockIcon,
	EyeIcon,
	FolderOpenIcon,
	MagnifyingGlassIcon,
	PuzzlePieceIcon,
	SparklesIcon,
} from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import RiveComponent from '@rive-app/react-canvas'

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
		<div className="py-16 sm:py-32">
			<div className="relative mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
					<div className="lg:pr-8 lg:pt-4">
						<div className="lg:max-w-lg" id={'features'}>
							<h2 className="text-base font-semibold leading-7 text-[#ff6545]">
								AI-Powered Image Metadata
							</h2>
							<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
								Optimize Your Images Effortlessly
							</p>
							<p className="mt-6 text-lg leading-8 text-gray-600">
								Our AI-powered tool simplifies the process of generating
								SEO-optimized image metadata, saving you time and effort while
								boosting your online visibility.
							</p>
							<dl className="mt-16 max-w-xl space-y-12 text-base leading-7 text-gray-600 lg:max-w-none">
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
					<div className="sticky top-[25vh] flex h-[50vh] w-full items-center justify-center">
						{isRiveLoaded && (
							<RiveComponent
								src="/animation_features/landing_art_forvoyez.riv"
								className="h-[50vh] w-[50vh]"
								autoPlay={true}
								stateMachines={'State Machine 1'}
							/>
						)}
					</div>
				</div>
			</div>
			{/*<div className="sticky-demo">*/}
			{/*	<div className="sticky-demo-container">*/}
			{/*		<div className="sticky-demo-item sticky-demo-shark-1">*/}
			{/*			<img*/}
			{/*				src="https://assets.digitalocean.com/labs/sammy/Sammy_punk.png"*/}
			{/*				width="100"*/}
			{/*				alt="Sammy the Shark with a punk theme."*/}
			{/*			/>*/}
			{/*		</div>*/}
			{/*		<div className="sticky-demo-item sticky-demo-shark-2">*/}
			{/*			<img*/}
			{/*				src="https://assets.digitalocean.com/labs/sammy/Sammy_pony.png"*/}
			{/*				width="100"*/}
			{/*				alt="Sammy the Shark with a magical pony theme."*/}
			{/*			/>*/}
			{/*		</div>*/}
			{/*		<div className="sticky-demo-item sticky-demo-shark-3">*/}
			{/*			<img*/}
			{/*				src="https://assets.digitalocean.com/labs/sammy/Sammy_stickers_SET03.png"*/}
			{/*				width="100"*/}
			{/*				alt="Sammy the Shark with a dinosaur theme."*/}
			{/*			/>*/}
			{/*		</div>*/}
			{/*		<div className="sticky-demo-item sticky-demo-shark-4">*/}
			{/*			<img*/}
			{/*				src="https://assets.digitalocean.com/labs/sammy/Sammy_stickers_SET01.png"*/}
			{/*				width="100"*/}
			{/*				alt="Sammy the Shark with a steampunk theme."*/}
			{/*			/>*/}
			{/*		</div>*/}
			{/*	</div>*/}
			{/*</div>*/}
		</div>
	)
}
