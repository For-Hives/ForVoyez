'use client'
import {
	BuildingOffice2Icon,
	EnvelopeIcon,
	PhoneIcon,
} from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

import { yupResolver } from '@hookform/resolvers/yup'
import Link from 'next/link'
import * as yup from 'yup'

import { FaqComponent } from '@/components/Contact/Faq.component'
import { sendEmail } from '@/app/actions/contact/sendEmail'

const schema = yup.object().shape({
	email: yup.string().email('Invalid email').required('Email is required'),
	'first-name': yup.string().required('First name is required'),
	'last-name': yup.string().required('Last name is required'),
	message: yup.string().required('Message is required'),
	'phone-number': yup.string(),
	company: yup.string(),
	subject: yup.string(),
})

export function ContactComponent() {
	const {
		formState: { errors },
		handleSubmit,
		register,
		reset,
	} = useForm({
		resolver: yupResolver(schema),
	})

	async function onSubmit(data) {
		const response = await sendEmail(data)

		if (response.success) {
			toast('Message sent successfully!', {
				toastId: 'toast-success',
				type: 'success',
				icon: '🚀',
			})
			reset()
		} else {
			toast(`An error occurred: ${response.details}`, {
				toastId: 'toast-alert',
				type: 'error',
				icon: '⛔',
			})
		}
	}

	return (
		<div className="relative isolate bg-white">
			<div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
				<div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
					<div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
						<div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gradient-to-r from-white to-transparent lg:w-1/2">
							<svg
								aria-hidden="true"
								className="absolute inset-0 h-full w-full stroke-slate-200 [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)]"
							>
								<defs>
									<pattern
										height={200}
										id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
										patternUnits="userSpaceOnUse"
										width={200}
										x="100%"
										y={-1}
									>
										<path d="M130 200V.5M.5 .5H200" fill="none" />
									</pattern>
								</defs>
								<rect fill="white" height="100%" strokeWidth={0} width="100%" />
								<svg className="overflow-visible fill-slate-50" x="100%" y={-1}>
									<path d="M-470.5 0h201v201h-201Z" strokeWidth={0} />
								</svg>
								<rect
									fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
									height="100%"
									strokeWidth={0}
									width="100%"
								/>
							</svg>
						</div>
						<h2 className="text-3xl font-bold tracking-tight text-slate-900">
							Get in touch
						</h2>
						<p className="mt-6 text-lg leading-8 text-slate-600">
							{`We'd love to hear from you! If you have any questions, feedback,
							or inquiries, please don't hesitate to reach out to us. Our team
							is dedicated to providing you with the best possible support.`}
						</p>
						<dl className="mt-10 space-y-4 text-base leading-7 text-slate-600">
							<div className="flex gap-x-4">
								<dt className="flex-none">
									<span className="sr-only">Address</span>
									<BuildingOffice2Icon
										aria-hidden="true"
										className="h-7 w-6 text-forvoyez_orange-500"
									/>
								</dt>
								<dd className={'font-bold'}>
									4 Impasse de la marchaisière
									<br />
									44115 Nantes
								</dd>
							</div>
							<div className="flex gap-x-4">
								<dt className="flex-none">
									<span className="sr-only">Telephone</span>
									<PhoneIcon
										aria-hidden="true"
										className="h-7 w-6 text-forvoyez_orange-500"
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
										aria-hidden="true"
										className="h-7 w-6 text-forvoyez_orange-500"
									/>
								</dt>
								<dd className={'font-bold'}>
									<Link
										className="hover:text-[#e05d45] hover:underline"
										href="mailto:contact@forvoyez.com"
									>
										contact@forvoyez.com
									</Link>
								</dd>
							</div>
						</dl>
					</div>
				</div>
				<form
					className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48"
					method="POST"
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
						<div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
							<div>
								<label
									className="block text-sm font-semibold leading-6 text-slate-900"
									htmlFor="first-name"
								>
									First name *
								</label>
								<div className="mt-2.5">
									<input
										autoComplete="given-name"
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors['first-name'] ? 'ring-red-500' : ''
										}`}
										id="first-name"
										name="first-name"
										type="text"
										{...register('first-name')}
									/>
									{errors['first-name'] && (
										<span className="text-sm text-red-500">
											{errors['first-name'].message}
										</span>
									)}
								</div>
							</div>
							<div>
								<label
									className="block text-sm font-semibold leading-6 text-slate-900"
									htmlFor="last-name"
								>
									Last name *
								</label>
								<div className="mt-2.5">
									<input
										autoComplete="family-name"
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors['last-name'] ? 'ring-red-500' : ''
										}`}
										id="last-name"
										name="last-name"
										type="text"
										{...register('last-name')}
									/>
									{errors['last-name'] && (
										<span className="text-sm text-red-500">
											{errors['last-name'].message}
										</span>
									)}
								</div>
							</div>
							<div className="sm:col-span-2">
								<label
									className="block text-sm font-semibold leading-6 text-slate-900"
									htmlFor="company"
								>
									Company
								</label>
								<div className="mt-2.5">
									<input
										autoComplete="organization"
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors.company ? 'ring-red-500' : ''
										}`}
										id="company"
										name="company"
										type="text"
										{...register('company')}
									/>
									{errors.company && (
										<span className="text-sm text-red-500">
											{errors.company.message}
										</span>
									)}
								</div>
							</div>
							<div className="sm:col-span-2">
								<label
									className="block text-sm font-semibold leading-6 text-slate-900"
									htmlFor="email"
								>
									Email *
								</label>
								<div className="mt-2.5">
									<input
										autoComplete="email"
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors.email ? 'ring-red-500' : ''
										}`}
										id="email"
										name="email"
										type="email"
										{...register('email')}
									/>
									{errors.email && (
										<span className="text-sm text-red-500">
											{errors.email.message}
										</span>
									)}
								</div>
							</div>
							<div className="sm:col-span-2">
								<label
									className="block text-sm font-semibold leading-6 text-slate-900"
									htmlFor="phone-number"
								>
									Phone number
								</label>
								<div className="mt-2.5">
									<input
										autoComplete="tel"
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors['phone-number'] ? 'ring-red-500' : ''
										}`}
										id="phone-number"
										name="phone-number"
										type="tel"
										{...register('phone-number')}
									/>
									{errors['phone-number'] && (
										<span className="text-sm text-red-500">
											{errors['phone-number'].message}
										</span>
									)}
								</div>
							</div>
							<div className="sm:col-span-2">
								<label
									className="block text-sm font-semibold leading-6 text-slate-900"
									htmlFor="subject"
								>
									Subject
								</label>
								<div className="mt-2.5">
									<input
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors.subject ? 'ring-red-500' : ''
										}`}
										id="subject"
										name="subject"
										type="text"
										{...register('subject')}
									/>
									{errors.subject && (
										<span className="text-sm text-red-500">
											{errors.subject.message}
										</span>
									)}
								</div>
							</div>
							<div className="sm:col-span-2">
								<label
									className="block text-sm font-semibold leading-6 text-slate-900"
									htmlFor="message"
								>
									Message *
								</label>
								<div className="mt-2.5">
									<textarea
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors.message ? 'ring-red-500' : ''
										}`}
										defaultValue={''}
										id="message"
										name="message"
										rows={4}
										{...register('message')}
									/>
									{errors.message && (
										<span className="text-sm text-red-500">
											{errors.message.message}
										</span>
									)}
								</div>
							</div>
						</div>
						<div className={'flex flex-col'}>
							<p className={'w-full text-right'}>
								<span className="w-full text-xs text-slate-600">
									Fields marked with an asterisk (*) are required.
								</span>
								<br />
							</p>
							<p className={'mt-2 text-right'}>
								<span className={'text-xs italic text-slate-600'}>
									By submitting this form, you agree that we may use the
									provided contact information to respond to your inquiry.
								</span>
							</p>
						</div>

						<div className="mt-2 flex justify-end">
							<button
								className="rounded-md bg-forvoyez_orange-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#e05d45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500"
								type="submit"
							>
								Send message
							</button>
						</div>
					</div>
				</form>
			</div>
			<div className="bg-white">
				<FaqComponent />
			</div>
		</div>
	)
}
