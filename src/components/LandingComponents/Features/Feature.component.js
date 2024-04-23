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
		name: 'Say goodbye to tedious metadata input tasks',
		description:
			'With our AI-powered tool, you can automate the generation of SEO-optimized alt texts, titles, and captions. No more wasting time manually inputting metadata - let our AI handle it while you focus on what matters most.',
		icon: SparklesIcon,
	},
	{
		name: 'Seamless integration in minutes',
		description: `Our well-documented RESTful API allows for seamless integration with your existing applications and workflows. With just a few lines of code, you can start generating optimized image metadata effortlessly. Take advantage of our API's flexibility and ease of use to streamline your development process.`,
		icon: PuzzlePieceIcon,
	},
	{
		name: 'Boost your search engine visibility',
		description:
			'Gain a competitive edge with our SEO-optimized image metadata. Our tool ensures your alt texts, titles, and captions are optimized for search engines, helping you improve your rankings, drive more organic traffic, and increase user engagement. See the difference optimized images can make for your online visibility.',
		icon: MagnifyingGlassIcon,
	},
	{
		name: 'Large-scale metadata in no time',
		description:
			'Whether you have dozens, hundreds, or thousands of images, our tool can handle the job. Take advantage of our powerful batch processing capability to generate metadata for entire image libraries in no time. With scalable infrastructure and top-notch performance, we cater to the needs of developers and businesses of all sizes.',
		icon: FolderOpenIcon,
	},
	{
		name: 'Create Images Accessible to Everyone',
		description:
			'By generating accurate alt texts and captions for your images, our tool helps you make your content accessible to a wider audience, including those using screen readers or assistive technologies. Improve the experience for all users and demonstrate your commitment to digital inclusivity.',
		icon: EyeIcon,
	},
	{
		name: 'Free Up Your Time for What Really Counts',
		description:
			'By automating image metadata creation, our tool allows you to save valuable time and free up resources that would otherwise be spent on tedious tasks. Focus on creating quality content, innovating, and growing your business, while letting our API handle the technical details.',
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
						// <Rive
						// 	src="./animation_features/landing_art_forvoyez.riv"
						// 	className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
						// 	width={2432}
						// 	height={1442}
						// />
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
