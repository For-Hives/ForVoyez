'use client'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { createToken } from '@/app/actions/tokens/TokensCRUD'
import { toast } from 'react-toastify'

const schema = yup.object().shape({
	name: yup.string().required('Name is required'),
	expiredAt: yup
		.date()
		.min(new Date(), 'Expiration date must be in the future')
		.required('Expiration date is required'),
})

export default function TokenModal({ isOpen, closeModal, tokens, setTokens }) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: yupResolver(schema),
	})

	async function onSubmit(data) {
		try {
			const newToken = {
				name: data.name,
				createdAt: new Date().toISOString(),
				expiredAt: data.expiredAt.toISOString(),
			}

			const result = await createToken(newToken)
			setTokens([...tokens, { ...newToken, id: result.id }])
			toast.success('Token created successfully')
			reset()
			closeModal()
		} catch (error) {
			toast.error('Failed to create token')
		}
	}

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={closeModal}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-25" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
								<Dialog.Title
									as="h3"
									className="text-lg font-medium leading-6 text-gray-900"
								>
									Create new secret key
								</Dialog.Title>
								<form onSubmit={handleSubmit(onSubmit)}>
									<div className="mt-4">
										<div className="relative">
											<label
												htmlFor="name"
												className="absolute -top-3 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900"
											>
												Name
											</label>
											<input
												type="text"
												name="name"
												id="name"
												className={`block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
													errors.name
														? 'ring-red-300 focus:ring-red-500'
														: 'ring-gray-300 focus:ring-forvoyez_orange-600'
												}`}
												placeholder="My API Key"
												{...register('name')}
											/>
											{errors.name && (
												<p className="mt-2 text-sm text-red-600">
													{errors.name.message}
												</p>
											)}
										</div>
										<div className="relative mt-4">
											<label
												htmlFor="expiredAt"
												className="absolute -top-3 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900"
											>
												Expiration Date
											</label>
											<input
												type="date"
												name="expiredAt"
												id="expiredAt"
												className={`block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
													errors.expiredAt
														? 'ring-red-300 focus:ring-red-500'
														: 'ring-gray-300 focus:ring-forvoyez_orange-600'
												}`}
												defaultValue={
													new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)
														.toISOString()
														.split('T')[0]
												}
												{...register('expiredAt')}
											/>
											{errors.expiredAt && (
												<p className="mt-2 text-sm text-red-600">
													{errors.expiredAt.message}
												</p>
											)}
										</div>
									</div>

									<div className="mt-4 flex justify-end space-x-2">
										<button
											type="button"
											className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
											onClick={closeModal}
										>
											Cancel
										</button>
										<button
											type="submit"
											className="inline-flex justify-center rounded-md border border-transparent bg-forvoyez_orange-100 px-4 py-2 text-sm font-medium text-forvoyez_orange-900 hover:bg-forvoyez_orange-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-forvoyez_orange-500 focus-visible:ring-offset-2"
										>
											Create Token
										</button>
									</div>
								</form>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}
