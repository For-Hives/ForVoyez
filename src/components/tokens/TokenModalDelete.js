import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function TokenModalDelete({
	isOpen,
	closeModal,
	token,
	onConfirm,
}) {
	const truncateToken = token => {
		if (!token) return ''
		const parts = token.split('.')
		if (parts.length !== 3) return token
		const payload = JSON.parse(atob(parts[1]))
		return `${payload.sub.slice(0, 4)}...${payload.sub.slice(-4)}`
	}

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={closeModal}>
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
									Revoke secret key
								</Dialog.Title>
								<div className="mt-2">
									<p className="text-sm text-gray-500">
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
									<p className="text-sm font-medium text-gray-900">Token:</p>
									<p className="text-sm text-gray-500">
										{truncateToken(token?.jwt)}
									</p>
								</div>

								<div className="mt-4 flex justify-end space-x-2">
									<button
										type="button"
										className="inline-flex justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
										onClick={closeModal}
									>
										Cancel
									</button>
									<button
										onClick={onConfirm}
										type="button"
										className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
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
