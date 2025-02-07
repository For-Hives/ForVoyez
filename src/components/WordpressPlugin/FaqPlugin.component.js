'use client'
import { Disclosure } from '@headlessui/react'

import { motion } from 'framer-motion'

const faqs = [
	{
		answer:
			'Our plugin uses advanced AI technology to analyze your images and generate accurate, SEO-friendly alt text. It considers the content, context, and relevant keywords to create descriptions that enhance both accessibility and search engine optimization.',
		question: "How does ForVoyez's WordPress plugin generate alt text?",
	},
	{
		answer:
			"Yes, our plugin is designed to be compatible with all standard WordPress themes. It works seamlessly in the background without interfering with your site's design or functionality.",
		question: 'Is the ForVoyez WordPress plugin compatible with my theme?',
	},
	{
		answer:
			'Absolutely! While our AI generates high-quality alt text automatically, you always have the option to review and edit the text before applying it to your images.',
		question: 'Can I customize the generated alt text?',
	},
	{
		answer:
			"No, our plugin is optimized for performance. The alt text generation happens in the background and doesn't affect your site's loading speed or user experience.",
		question: 'Will using this plugin slow down my website?',
	},
	{
		answer:
			'Our plugin supports multiple languages. You can set your preferred language in the plugin settings, and the AI will generate alt text in that language.',
		question: 'How does the plugin handle images in different languages?',
	},
	{
		answer:
			'Yes, we take data privacy very seriously. Our plugin processes your images securely, and we do not store or share your image data. All processing is done in compliance with data protection regulations.',
		question: 'Is my image data safe when using this plugin?',
	},
	{
		answer:
			'We recommend keeping the plugin updated to the latest version to ensure you have access to the newest features and security updates. You can enable auto-updates or manually update whenever a new version is available.',
		question: 'How often should I update the plugin?',
	},
	{
		answer:
			'Yes, you can use our free plugin on as many WordPress websites as you like. There are no restrictions on the number of sites or images you can optimize.',
		question: 'Can I use this plugin on multiple websites?',
	},
]

export function FaqPluginComponent() {
	return (
		<div className="py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-7xl divide-y divide-gray-900/10">
					<h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
						Frequently asked questions
					</h2>
					<dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
						{faqs.map((faq, index) => (
							<Disclosure as="div" className="pt-6" key={faq.question}>
								{({ open }) => (
									<>
										<dt>
											<Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
												<span className="text-base font-semibold leading-7">
													{faq.question}
												</span>
												<span className="ml-6 flex h-7 items-center">
													<motion.svg
														animate={{ rotate: open ? 180 : 0 }}
														className="h-6 w-6"
														fill="none"
														stroke="currentColor"
														strokeWidth="1.5"
														viewBox="0 0 24 24"
													>
														<path
															d="M19 9l-7 7-7-7"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</motion.svg>
												</span>
											</Disclosure.Button>
										</dt>
										<Disclosure.Panel as="dd" className="mt-2 pr-12">
											<motion.p
												animate={{ opacity: 1, y: 0 }}
												className="text-base leading-7 text-gray-600"
												exit={{ opacity: 0, y: -10 }}
												initial={{ opacity: 0, y: -10 }}
											>
												{faq.answer}
											</motion.p>
										</Disclosure.Panel>
									</>
								)}
							</Disclosure>
						))}
					</dl>
				</div>
			</div>
		</div>
	)
}
