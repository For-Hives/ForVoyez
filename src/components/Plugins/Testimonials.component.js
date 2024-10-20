'use client'
import Image from 'next/image'

const featuredTestimonial = {
	body: "ForVoyez's WordPress plugin has revolutionized our image SEO strategy. The AI-generated alt text is not only accurate but also SEO-optimized, saving us countless hours of manual work.",
	author: {
		logoUrl: '/images/plugins/logo-tell-me.png',
		imageUrl: '/images/plugins/sarah.webp',
		handle: 'sarahjohnson',
		name: 'Sarah Johnson',
	},
}

const testimonials = [
	[
		[
			{
				body: "The automated alt text generation has dramatically improved our site's accessibility. Our visually impaired users have noticed the difference.",
				author: {
					imageUrl: '/images/plugins/michael.webp',
					handle: 'michaelchen',
					name: 'Michael Chen',
				},
			},
			{
				body: "As a photographer, I was skeptical about AI-generated descriptions. But ForVoyez's plugin has consistently produced accurate and SEO-friendly alt text for my portfolio.",
				author: {
					imageUrl: '/images/plugins/emma.webp',
					name: 'Emma Rodriguez',
					handle: 'emmashots',
				},
			},
		],
		[
			{
				body: "The plugin's bulk processing feature allowed us to optimize thousands of product images in a matter of hours. It's been a game-changer for our e-commerce site.",
				author: {
					imageUrl: '/images/plugins/alex.webp',
					handle: 'alextan',
					name: 'Alex Tan',
				},
			},
		],
	],
	[
		[
			{
				body: "ForVoyez's multi-language support has helped us reach a global audience. Our international SEO has improved significantly since we started using the plugin.",
				author: {
					imageUrl: '/images/plugins/sophie.webp',
					handle: 'sophiedubois',
					name: 'Sophie Dubois',
				},
			},
		],
		[
			{
				body: "The customizable output formats allow us to tailor the alt text to our brand voice. It's like having an SEO expert and a copywriter rolled into one plugin.",
				author: {
					imageUrl: '/images/plugins/david.webp',
					handle: 'davidlee',
					name: 'David Lee',
				},
			},
		],
	],
]

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

export function TestimonialsComponent() {
	return (
		<div className="relative isolate bg-white pb-32 pt-24 sm:pt-32">
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl"
			>
				<div
					className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-forvoyez_orange-300 to-forvoyez_orange-500"
					style={{
						clipPath:
							'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
					}}
				/>
			</div>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-xl text-center">
					<h2 className="text-lg font-semibold leading-8 tracking-tight text-forvoyez_orange-500">
						Testimonials
					</h2>
					<p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
						Hear from our satisfied users
					</p>
				</div>
				<div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
					<figure className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 sm:col-span-2 xl:col-start-2 xl:row-end-1">
						<blockquote className="p-6 text-lg font-semibold leading-7 tracking-tight text-gray-900 sm:p-12 sm:text-xl sm:leading-8">
							<p>{`"${featuredTestimonial.body}"`}</p>
						</blockquote>
						<figcaption className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-900/10 px-6 py-4 sm:flex-nowrap">
							<Image
								alt=""
								className="h-10 w-10 flex-none rounded-full bg-gray-50"
								height={40}
								src={featuredTestimonial.author.imageUrl}
								width={40}
							/>
							<div className="flex-auto">
								<div className="font-semibold">
									{featuredTestimonial.author.name}
								</div>
								<div className="text-gray-600">{`@${featuredTestimonial.author.handle}`}</div>
							</div>
							<Image
								alt=""
								className="h-10 w-auto flex-none"
								height={40}
								src={featuredTestimonial.author.logoUrl}
								width={40}
							/>
						</figcaption>
					</figure>
					{testimonials.map((columnGroup, columnGroupIdx) => (
						<div
							className="space-y-8 xl:contents xl:space-y-0"
							key={columnGroupIdx}
						>
							{columnGroup.map((column, columnIdx) => (
								<div
									className={classNames(
										(columnGroupIdx === 0 && columnIdx === 0) ||
											(columnGroupIdx === testimonials.length - 1 &&
												columnIdx === columnGroup.length - 1)
											? 'xl:row-span-2'
											: 'xl:row-start-1',
										'space-y-8'
									)}
									key={columnIdx}
								>
									{column.map(testimonial => (
										<figure
											className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
											key={testimonial.author.handle}
										>
											<blockquote className="text-gray-900">
												<p>{`"${testimonial.body}"`}</p>
											</blockquote>
											<figcaption className="mt-6 flex items-center gap-x-4">
												<Image
													alt=""
													className="h-10 w-10 rounded-full bg-gray-50"
													height={40}
													src={testimonial.author.imageUrl}
													width={40}
												/>
												<div>
													<div className="font-semibold">
														{testimonial.author.name}
													</div>
													<div className="text-gray-600">{`@${testimonial.author.handle}`}</div>
												</div>
											</figcaption>
										</figure>
									))}
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
