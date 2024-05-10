'use client'
import {
	BuildingOffice2Icon,
	EnvelopeIcon,
	PhoneIcon,
} from '@heroicons/react/24/outline'
import { yupResolver } from '@hookform/resolvers/yup'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'

import { sendEmail } from '@/app/actions/contact/sendEmail'
import { FaqComponent } from '@/components/Contact/Faq.component'

const schema = yup.object().shape({
	'first-name': yup.string().required('First name is required'),
	'last-name': yup.string().required('Last name is required'),
	company: yup.string(),
	email: yup.string().email('Invalid email').required('Email is required'),
	'phone-number': yup.string(),
	subject: yup.string(),
	message: yup.string().required('Message is required'),
})

export function ContactComponent() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: yupResolver(schema),
	})

	async function onSubmit(data) {
		const response = await sendEmail(data)

		if (response.success) {
			toast('Message sent successfully!', {
				type: 'success',
				icon: '🚀',
				toastId: 'toast-success',
			})
			reset()
		} else {
			toast(`An error occurred: ${response.details}`, {
				type: 'error',
				icon: '⛔',
				toastId: 'toast-alert',
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
								className="absolute inset-0 h-full w-full stroke-slate-200 [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)]"
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
								<svg x="100%" y={-1} className="overflow-visible fill-slate-50">
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
										className="h-7 w-6 text-forvoyez_orange-500"
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
										className="h-7 w-6 text-forvoyez_orange-500"
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
										className="h-7 w-6 text-forvoyez_orange-500"
										aria-hidden="true"
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
					onSubmit={handleSubmit(onSubmit)}
					method="POST"
					className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48"
				>
					<div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
						<div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
							<div>
								<label
									htmlFor="first-name"
									className="block text-sm font-semibold leading-6 text-slate-900"
								>
									First name *
								</label>
								<div className="mt-2.5">
									<input
										type="text"
										name="first-name"
										id="first-name"
										autoComplete="given-name"
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors['first-name'] ? 'ring-red-500' : ''
										}`}
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
									htmlFor="last-name"
									className="block text-sm font-semibold leading-6 text-slate-900"
								>
									Last name *
								</label>
								<div className="mt-2.5">
									<input
										type="text"
										name="last-name"
										id="last-name"
										autoComplete="family-name"
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors['last-name'] ? 'ring-red-500' : ''
										}`}
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
									htmlFor="company"
									className="block text-sm font-semibold leading-6 text-slate-900"
								>
									Company
								</label>
								<div className="mt-2.5">
									<input
										type="text"
										name="company"
										id="company"
										autoComplete="organization"
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors.company ? 'ring-red-500' : ''
										}`}
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
									htmlFor="email"
									className="block text-sm font-semibold leading-6 text-slate-900"
								>
									Email *
								</label>
								<div className="mt-2.5">
									<input
										type="email"
										name="email"
										id="email"
										autoComplete="email"
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors.email ? 'ring-red-500' : ''
										}`}
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
									htmlFor="phone-number"
									className="block text-sm font-semibold leading-6 text-slate-900"
								>
									Phone number
								</label>
								<div className="mt-2.5">
									<input
										type="tel"
										name="phone-number"
										id="phone-number"
										autoComplete="tel"
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors['phone-number'] ? 'ring-red-500' : ''
										}`}
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
									htmlFor="subject"
									className="block text-sm font-semibold leading-6 text-slate-900"
								>
									Subject
								</label>
								<div className="mt-2.5">
									<input
										type="text"
										name="subject"
										id="subject"
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors.subject ? 'ring-red-500' : ''
										}`}
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
									htmlFor="message"
									className="block text-sm font-semibold leading-6 text-slate-900"
								>
									Message *
								</label>
								<div className="mt-2.5">
									<textarea
										name="message"
										id="message"
										rows={4}
										className={`block w-full rounded-md border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-500/30 sm:text-sm sm:leading-6 ${
											errors.message ? 'ring-red-500' : ''
										}`}
										defaultValue={''}
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
								type="submit"
								className="rounded-md bg-forvoyez_orange-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#e05d45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-500"
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
