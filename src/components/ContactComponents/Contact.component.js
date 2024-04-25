import {
	BuildingOffice2Icon,
	EnvelopeIcon,
	PhoneIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { sendEmail } from '@/app/actions/contact/sendEmail'

export function ContactComponent() {
	return (
		<div className="relative isolate bg-white">
			<div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
				<div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
					<div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
						<div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gradient-to-r from-white to-transparent lg:w-1/2">
							<svg
								className="absolute inset-0 h-full w-full stroke-gray-200 [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)]"
								aria-hidden="true"
							>
								<defs>
									<pattern
										id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
										width={200}
										height={200}
										x="100%"
										y={-1}
										patternUnits="userSpaceOnUse"
									>
										<path d="M130 200V.5M.5 .5H200" fill="none" />
									</pattern>
								</defs>
								<rect width="100%" height="100%" strokeWidth={0} fill="white" />
								<svg x="100%" y={-1} className="overflow-visible fill-gray-50">
									<path d="M-470.5 0h201v201h-201Z" strokeWidth={0} />
								</svg>
								<rect
									width="100%"
									height="100%"
									strokeWidth={0}
									fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
								/>
							</svg>
						</div>
						<h2 className="text-3xl font-bold tracking-tight text-gray-900">
							Get in touch
						</h2>
						<p className="mt-6 text-lg leading-8 text-gray-600">
							{`We'd love to hear from you! If you have any questions, feedback,
							or inquiries, please don't hesitate to reach out to us. Our team
							is dedicated to providing you with the best possible support.`}
						</p>
						<dl className="mt-10 space-y-4 text-base leading-7 text-gray-600">
							<div className="flex gap-x-4">
								<dt className="flex-none">
									<span className="sr-only">Address</span>
									<BuildingOffice2Icon
										className="h-7 w-6 text-[#ff6545]"
										aria-hidden="true"
									/>
								</dt>
								<dd className={'font-bold'}>
									72 Avenue Camus
									<br />
									44000 Nantes
								</dd>
							</div>
							<div className="flex gap-x-4">
								<dt className="flex-none">
									<span className="sr-only">Telephone</span>
									<PhoneIcon
										className="h-7 w-6 text-[#ff6545]"
										aria-hidden="true"
									/>
								</dt>
								<dd className={'font-bold'}>
									<Link
										className="hover:text-[#e05d45] hover:underline"
										href="tel:+33621582684"
									>
										+33 6 21 58 26 84
									</Link>
								</dd>
							</div>
							<div className="flex gap-x-4">
								<dt className="flex-none">
									<span className="sr-only">Email</span>
									<EnvelopeIcon
										className="h-7 w-6 text-[#ff6545]"
										aria-hidden="true"
									/>
								</dt>
								<dd className={'font-bold'}>
									<Link
										className="hover:text-[#e05d45] hover:underline"
										href="mailto:contact@forvoyez.fr"
									>
										contact@forvoyez.fr
									</Link>
								</dd>
							</div>
						</dl>
					</div>
				</div>
				<form
					action={sendEmail}
					method="POST"
					className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48"
				>
					<div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
						<div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
							<div>
								<label
									htmlFor="first-name"
									className="block text-sm font-semibold leading-6 text-gray-900"
								>
									First name
								</label>
								<div className="mt-2.5">
									<input
										type="text"
										name="first-name"
										id="first-name"
										autoComplete="given-name"
										className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#ff6545] sm:text-sm sm:leading-6"
									/>
								</div>
							</div>
							<div>
								<label
									htmlFor="last-name"
									className="block text-sm font-semibold leading-6 text-gray-900"
								>
									Last name
								</label>
								<div className="mt-2.5">
									<input
										type="text"
										name="last-name"
										id="last-name"
										autoComplete="family-name"
										className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#ff6545] sm:text-sm sm:leading-6"
									/>
								</div>
							</div>
							<div className="sm:col-span-2">
								<label
									htmlFor="company"
									className="block text-sm font-semibold leading-6 text-gray-900"
								>
									Company
								</label>
								<div className="mt-2.5">
									<input
										type="text"
										name="company"
										id="company"
										autoComplete="organization"
										className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#ff6545] sm:text-sm sm:leading-6"
									/>
								</div>
							</div>
							<div className="sm:col-span-2">
								<label
									htmlFor="email"
									className="block text-sm font-semibold leading-6 text-gray-900"
								>
									Email
								</label>
								<div className="mt-2.5">
									<input
										type="email"
										name="email"
										id="email"
										autoComplete="email"
										className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#ff6545] sm:text-sm sm:leading-6"
									/>
								</div>
							</div>
							<div className="sm:col-span-2">
								<label
									htmlFor="phone-number"
									className="block text-sm font-semibold leading-6 text-gray-900"
								>
									Phone number
								</label>
								<div className="mt-2.5">
									<input
										type="tel"
										name="phone-number"
										id="phone-number"
										autoComplete="tel"
										className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#ff6545] sm:text-sm sm:leading-6"
									/>
								</div>
							</div>
							<div className="sm:col-span-2">
								<label
									htmlFor="subject"
									className="block text-sm font-semibold leading-6 text-gray-900"
								>
									Subject
								</label>
								<div className="mt-2.5">
									<input
										type="text"
										name="subject"
										id="subject"
										className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#ff6545] sm:text-sm sm:leading-6"
									/>
								</div>
							</div>
							<div className="sm:col-span-2">
								<label
									htmlFor="message"
									className="block text-sm font-semibold leading-6 text-gray-900"
								>
									Message
								</label>
								<div className="mt-2.5">
									<textarea
										name="message"
										id="message"
										rows={4}
										className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#ff6545] sm:text-sm sm:leading-6"
										defaultValue={''}
									/>
								</div>
							</div>
						</div>
						<div className="mt-8 flex justify-end">
							<button
								type="submit"
								className="rounded-md bg-[#ff6545] px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#e05d45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6545]"
							>
								Send message
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	)
}
