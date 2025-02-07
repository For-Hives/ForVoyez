import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function TokenModalDelete({
	closeModal,
	onConfirm,
	isOpen,
	token,
}) {
	return (
		<Transition appear as={Fragment} show={isOpen}>
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
					<div className="bg-opacity-25 fixed inset-0 bg-black" />
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
									className="text-lg leading-6 font-medium text-slate-900"
								>
									Revoke secret key
								</Dialog.Title>
								<div className="mt-2">
									<p className="text-sm text-slate-500">
										Revoking this API key will immediately disable it,
										preventing any further API requests from being made with it.
										Any systems or applications currently using this key may
										stop functioning correctly. Please ensure you have updated
										your integration to use a new key before proceeding. Once
										revoked, this key will no longer be accessible or
										manageable.
									</p>
								</div>

								<div className="mt-4">
									<p className="text-sm font-medium text-slate-900">Token:</p>
									<p className="text-sm text-slate-500">{token?.jwt}</p>
								</div>

								<div className="mt-4 flex justify-end space-x-2">
									<button
										className="inline-flex justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
										onClick={closeModal}
										type="button"
									>
										Cancel
									</button>
									<button
										className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
										data-testid="revoke-key-button"
										onClick={onConfirm}
										type="button"
									>
										Revoke Key
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}
