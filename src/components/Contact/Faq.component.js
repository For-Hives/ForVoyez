import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const faqs = [
	{
		question: 'What is ForVoyez and what services do you offer?',
		answer:
			'ForVoyez is a SaaS platform that automatically generates optimized alternative text, titles, and captions for images using AI. Our API processes your images and returns SEO-friendly metadata in a JSON format. The API allows you to customize the JSON response and can be used for a variety of purposes. Simply send an image along with optional context and a data schema, and receive a properly formatted response tailored to your needs.',
	},
	{
		question: 'How do I get started with ForVoyez?',
		answer:
			'To get started, sign up for an account on our website. Once your account is set up, you can create API keys to access our services. Alternatively, you can use our playground to experiment with the API without needing an API key.',
	},
	{
		question: 'What are the available subscription plans and pricing?',
		answer: `We offer several subscription plans to suit different needs:
      <ul className="!list-disc pl-5 text-slate-600">
        <li className="!list-disc">Starter: Perfect for small entrepreneurs and occasional use.</li>
        <li className="!list-disc">Growth: Ideal for regular, daily usage.</li>  
        <li className="!list-disc">Enterprise: Tailored for high-volume users and large organizations.</li>
      </ul>
      Please check our pricing page for more details on each plan and current rates.`,
	},
	{
		question: 'How do I integrate ForVoyez into my application?',
		answer:
			'Integrating ForVoyez is easy and can be done in any environment that can send a standard HTTP POST request and receive a JSON response. Our well-documented API allows you to send requests with your API key, an image, and optional parameters like a JSON schema or additional context. The API will process your request and return the generated metadata. Check out our documentation for code examples and detailed instructions.',
	},
	{
		question: 'What image formats do you support?',
		answer:
			'We support the most common web image formats, including JPEG, PNG, WebP, and GIF.',
	},
	{
		question: 'Is there a limit to the number of API requests I can make?',
		answer:
			'API request limits depend on your subscription plan. The Starter and Growth plans have set limits, while the Enterprise plan can be customized to your needs. You can monitor your usage from your account dashboard.',
	},
	{
		question: 'How can I get support if I have any issues or questions?',
		answer: `Our support team is here to help! If you have any questions, issues, or feedback, please don't hesitate to reach out through our contact form or by emailing support@forvoyez.com. We strive to respond to all inquiries within 24 hours.`,
	},
]

export function FaqComponent() {
	return (
		<div className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32 lg:px-8 lg:pb-40">
			<div className="mx-auto max-w-4xl divide-y divide-slate-900/10">
				<h2 className="text-2xl font-bold leading-10 tracking-tight text-slate-900">
					Frequently Asked Questions
				</h2>
				<dl className="mt-10 space-y-6 divide-y divide-slate-900/10">
					{faqs.map((faq, index) => (
						<Disclosure as="div" key={index} className="pt-6">
							{({ open }) => (
								<>
									<dt>
										<DisclosureButton className="flex w-full items-start justify-between text-left text-slate-900">
											<span className="text-base font-semibold leading-7">
												{faq.question}
											</span>
											<span className="ml-6 flex h-7 items-center">
												<ChevronDownIcon
													className={`h-6 w-6 fill-forvoyez_orange-500 transition duration-300 ${
														open ? 'rotate-180' : ''
													}`}
													aria-hidden="true"
												/>
											</span>
										</DisclosureButton>
									</dt>
									<DisclosurePanel className="mt-2 pr-12">
										<div
											className="text-base leading-7 text-slate-600"
											dangerouslySetInnerHTML={{ __html: faq.answer }}
										></div>
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
