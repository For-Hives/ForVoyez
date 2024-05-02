'use client'
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

export default function TokenModal({ isOpen, onClose, tokens, setTokens }) {
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
			onClose()
		} catch (error) {
			toast.error('Failed to create token')
		}
	}

	return (
		<>
			{isOpen && (
				<div className="fixed inset-0 z-10 overflow-y-auto">
					<div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
						<div
							className="fixed inset-0 transition-opacity"
							aria-hidden="true"
						>
							<div className="absolute inset-0 bg-gray-500 opacity-75"></div>
						</div>

						<span
							className="hidden sm:inline-block sm:h-screen sm:align-middle"
							aria-hidden="true"
						>
							&#8203;
						</span>

						<dialog
							className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
							aria-modal="true"
							aria-labelledby="modal-headline"
						>
							<form onSubmit={handleSubmit(onSubmit)}>
								<div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
									<h3
										className="text-lg font-medium leading-6 text-gray-900"
										id="modal-headline"
									>
										Create new secret key
									</h3>
									<div className="mt-4">
										<div className="relative">
											<label
												htmlFor="name"
												className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900"
											>
												Name
											</label>
											<input
												type="text"
												name="name"
												id="name"
												className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
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
												className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900"
											>
												Expiration Date
											</label>
											<input
												type="date"
												name="expiredAt"
												id="expiredAt"
												className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
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
								</div>
								<div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
									<button
										type="submit"
										className="inline-flex w-full justify-center rounded-md border border-transparent bg-forvoyez_orange-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-forvoyez_orange-700 focus:outline-none focus:ring-2 focus:ring-forvoyez_orange-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
									>
										Create Token
									</button>
									<button
										type="button"
										className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forvoyez_orange-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
										onClick={onClose}
									>
										Cancel
									</button>
								</div>
							</form>
						</dialog>
					</div>
				</div>
			)}
		</>
	)
}
