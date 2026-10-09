import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const faqs = [
	{
		question: 'What does ForVoyez do for my WordPress website?',
		answer:
			'ForVoyez helps you write alt text, titles, and captions for images in your WordPress media library. Use the plugin to generate descriptions for existing images in bulk, or enable generation for new uploads.',
	},
	{
		question: 'How do I get started?',
		answer:
			'Install Auto Alt Text for Images from the WordPress plugin directory. Create a ForVoyez account, choose a plan, then copy your API key into the plugin settings to connect your account. No coding is needed.',
	},
	{
		question: 'Is the plugin free, and what do credits pay for?',
		answer:
			'The plugin is free to install. Image generation uses credits from your ForVoyez account: one successfully processed image uses one credit and produces alt text, a title, and a caption. See the pricing section for current plans and credit allowances.',
	},
	{
		question: 'Can I edit the text and choose a language?',
		answer:
			'Yes. Set your preferred language and add context in the plugin settings. Review and edit the generated descriptions in WordPress so they fit your images and pages.',
	},
	{
		question: 'Which image formats can I use?',
		answer: 'ForVoyez supports JPEG, PNG, WebP, and non-animated GIF images up to 10 MB.',
	},
	{
		question: 'How can I get help with the plugin?',
		answer:
			'Use the contact form to tell us where you are stuck: installation, connecting your account, credits, or generating descriptions. Include any error message, but never send your account key.',
	},
	{
		question: 'Where are my images processed?',
		answer:
			'Images submitted through the plugin are sent to ForVoyez and its AI processing provider, OpenAI. Read our privacy policy for details about processing and service providers.',
	},
]

export function FaqComponent() {
	return (
		<div className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32 lg:px-8 lg:pb-40">
			<div className="mx-auto max-w-4xl divide-y divide-slate-900/10">
				<h2 className="text-2xl leading-10 font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
				<dl className="mt-10 space-y-6 divide-y divide-slate-900/10">
					{faqs.map(faq => (
						<Disclosure as="div" className="pt-6" key={faq.question}>
							{({ open }) => (
								<>
									<dt>
										<DisclosureButton className="flex w-full items-start justify-between text-left text-slate-900">
											<span className="text-base leading-7 font-semibold">{faq.question}</span>
											<span className="ml-6 flex h-7 items-center">
												<ChevronDownIcon
													aria-hidden="true"
													className={`fill-forvoyez_orange-500 h-6 w-6 transition duration-300 ${
														open ? 'rotate-180' : ''
													}`}
												/>
											</span>
										</DisclosureButton>
									</dt>
									<DisclosurePanel className="mt-2 pr-12">
										<p className="text-base leading-7 text-slate-600">{faq.answer}</p>
									</DisclosurePanel>
								</>
							)}
						</Disclosure>
					))}
				</dl>
			</div>
		</div>
	)
}
