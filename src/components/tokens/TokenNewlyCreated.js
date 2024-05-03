'use client'
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

export default function TokenNewlyCreated({ isOpen, closeModal, token }) {
	const [isCopied, setIsCopied] = useState(false)

	const handleCopy = () => {
		setIsCopied(true)
		setTimeout(() => setIsCopied(false), 1500)
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
									New Token Created
								</Dialog.Title>
								<div className="mt-2">
									<p className="text-sm text-gray-500">
										Please copy your new token. You won't be able to see it
										again!
									</p>
								</div>

								<div className="mt-4 flex rounded-md shadow-sm">
									<div className="relative flex flex-grow items-stretch focus-within:z-10">
										<input
											type="text"
											name="token"
											id="token"
											className="block w-full rounded-none rounded-l-md border-0 py-1.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
											value={token}
											readOnly
										/>
									</div>
									<CopyToClipboard text={token} onCopy={handleCopy}>
										<button
											type="button"
											className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
										>
											{isCopied ? 'Copied!' : 'Copy'}
										</button>
									</CopyToClipboard>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}
