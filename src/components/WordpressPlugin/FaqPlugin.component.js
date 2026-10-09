'use client'
import { Disclosure } from '@headlessui/react'
import { motion } from 'motion/react'

const faqs = [
	{
		question: 'Do I need to know how to code?',
		answer:
			'No. Install the plugin in WordPress, create a ForVoyez account, and copy your API key into the plugin settings. After this one-time connection, generate descriptions from your WordPress media library.',
	},
	{
		question: 'Is the plugin free?',
		answer:
			'The WordPress plugin is free to install. Generating descriptions uses credits from your ForVoyez account. One successfully processed image uses one credit and produces its alt text, title, and caption. Check the pricing section for current plans.',
	},
	{
		question: 'Can I describe images already in my media library?',
		answer:
			'Yes. Select multiple existing images in your WordPress media library and use the bulk generation action. You can also generate a description for an individual image.',
	},
	{
		question: 'What happens when I upload new images?',
		answer:
			'You can enable automatic generation for new uploads in the plugin settings. If you prefer to decide which images to process, leave it disabled and generate descriptions yourself.',
	},
	{
		question: 'Can I edit the generated descriptions?',
		answer:
			'Yes. Review the generated alt text, titles, and captions in WordPress and edit them to fit your content. AI-generated descriptions can need corrections, especially when the purpose of an image depends on the page around it.',
	},
	{
		question: 'Can I choose the language?',
		answer:
			'Yes. Choose your preferred language in the plugin settings. You can also add context to guide the generated descriptions.',
	},
	{
		question: 'Does this replace all my SEO or accessibility work?',
		answer:
			'The plugin helps with image descriptions. Search rankings depend on many factors, and accessible pages need more than alt text. Review descriptions in the context of your content, including whether an image is decorative.',
	},
	{
		question: 'Where are my images processed?',
		answer:
			'Images submitted for generation are sent to ForVoyez and its AI processing provider, OpenAI. See our privacy policy for details about processing and service providers.',
	},
]

export function FaqPluginComponent() {
	return (
		<div className="py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-7xl divide-y divide-gray-900/10">
					<h2 className="text-2xl leading-10 font-bold tracking-tight text-gray-900">Frequently asked questions</h2>
					<dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
						{faqs.map(faq => (
							<Disclosure as="div" className="pt-6" key={faq.question}>
								{({ open }) => (
									<>
										<dt>
											<Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
												<span className="text-base leading-7 font-semibold">{faq.question}</span>
												<span className="ml-6 flex h-7 items-center">
													<motion.svg
														animate={{ rotate: open ? 180 : 0 }}
														className="h-6 w-6"
														fill="none"
														stroke="currentColor"
														strokeWidth="1.5"
														viewBox="0 0 24 24"
													>
														<path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
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
