import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon, ClipboardIcon } from '@heroicons/react/20/solid'
import { yupResolver } from '@hookform/resolvers/yup'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'

import { createToken } from '@/app/actions/tokens/TokensCRUD'

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

	const [isCopied, setIsCopied] = useState(false)
	const [tokenToDisplayInClipBoardField, setTokenToDisplayInClipBoardField] =
		useState('')

	const copyToClipboard = token => {
		if (navigator.clipboard) {
			navigator.clipboard
				.writeText(token)
				.then(() => {})
				.catch(err => {
					console.error('Failed to copy:', err)
				})
		} else {
			// Fallback to older execCommand approach
			const textarea = document.createElement('textarea')
			textarea.value = token
			document.body.appendChild(textarea)
			textarea.select()
			try {
				document.execCommand('copy')
			} catch (err) {
				console.error('Failed to copy with execCommand:', err)
			}
			document.body.removeChild(textarea)
		}

		setIsCopied(true)
		setTimeout(() => setIsCopied(false), 1500)
	}

	async function onSubmit(data) {
		try {
			const newToken = {
				name: data.name,
				createdAt: new Date().toISOString(),
				expiredAt: data.expiredAt.toISOString(),
			}

			let result = await createToken(newToken)
			setTokenToDisplayInClipBoardField(result.jwt)
			setTokens([
				...tokens,
				{ ...newToken, id: result.id, jwt: result.jwt_shortened },
			])
			reset()
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
					<div className="flex min-h-full items-start justify-center px-4 pt-32 text-center md:items-center md:p-4">
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
									className="text-lg font-medium leading-6 text-slate-900"
								>
									{!tokenToDisplayInClipBoardField ? (
										<>Create new secret key</>
									) : (
										<>Your secret key</>
									)}
								</Dialog.Title>
								<form onSubmit={handleSubmit(onSubmit)}>
									<div className="mt-4">
										{tokenToDisplayInClipBoardField && (
											<p className="text-sm text-slate-500">
												Your secret key is generated successfully. Please copy
												it and keep it in a safe place. You will not be able to
												see it again.
											</p>
										)}
										{!tokenToDisplayInClipBoardField && (
											<>
												<div className="relative">
													<label
														htmlFor="name"
														className="absolute -top-3 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-900"
													>
														Name
													</label>
													<input
														type="text"
														name="name"
														id="name"
														className={`block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
															errors.name
																? 'ring-red-300 focus:ring-red-500'
																: 'ring-slate-300 focus:ring-forvoyez_orange-600'
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
														className="absolute -top-3 left-2 inline-block bg-white px-1 text-xs font-medium text-slate-900"
													>
														Expiration Date
													</label>
													<input
														type="date"
														name="expiredAt"
														id="expiredAt"
														className={`block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
															errors.expiredAt
																? 'ring-red-300 focus:ring-red-500'
																: 'ring-slate-300 focus:ring-forvoyez_orange-600'
														}`}
														defaultValue={
															new Date(
																Date.now() + 10 * 365 * 24 * 60 * 60 * 1000
															)
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
											</>
										)}
									</div>

									<div className={'mt-4'}>
										{tokenToDisplayInClipBoardField &&
											tokenToDisplayInClipBoardField.length > 15 && (
												<div className="mt-4">
													<label
														htmlFor="token"
														className="block text-sm font-medium leading-6 text-slate-900"
													>
														Your New Token
													</label>
													<div className="mt-2 flex rounded-md shadow-sm">
														<div className="relative flex flex-grow items-stretch focus-within:z-10">
															<input
																type="text"
																name="token"
																id="token"
																className="block w-full rounded-none rounded-l-md border-0 py-1.5 pl-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-600 sm:text-sm sm:leading-6"
																value={tokenToDisplayInClipBoardField}
																readOnly
															/>
														</div>
														<button
															type="button"
															className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
															onClick={() =>
																copyToClipboard(tokenToDisplayInClipBoardField)
															}
														>
															{isCopied ? (
																<CheckIcon
																	className="-ml-0.5 h-5 w-5 text-green-400"
																	aria-hidden="true"
																/>
															) : (
																<ClipboardIcon
																	className="-ml-0.5 h-5 w-5 text-slate-400"
																	aria-hidden="true"
																/>
															)}
															{isCopied ? 'Copied!' : 'Copy'}
														</button>
													</div>
												</div>
											)}
									</div>
									<div className="mt-4 flex justify-end space-x-2">
										{!(tokenToDisplayInClipBoardField.length > 15) && (
											<>
												<button
													type="button"
													className="inline-flex justify-center rounded-md border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
													onClick={closeModal}
												>
													Cancel
												</button>
												<button
													type="submit"
													className="block rounded-md bg-forvoyez_orange-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-forvoyez_orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-600"
												>
													Create Token
												</button>
											</>
										)}
										{tokenToDisplayInClipBoardField &&
											tokenToDisplayInClipBoardField.length > 15 && (
												<button
													type={'button'}
													className="block rounded-md bg-forvoyez_orange-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-forvoyez_orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-600"
													onClick={() => {
														setTokenToDisplayInClipBoardField('')
														closeModal()
													}}
												>
													I copied it
												</button>
											)}
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
