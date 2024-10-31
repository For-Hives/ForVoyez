'use client'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { deleteToken, getAllToken } from '@/app/actions/tokens/TokensCRUD'

import TokenModalDelete from '@/components/Tokens/TokenModalDelete'
import TokenModal from '@/components/Tokens/TokenModal'

import 'react-toastify/dist/ReactToastify.css'

export default function TokenList() {
	const [tokens, setTokens] = useState([])

	const [isModalOpen, setIsModalOpen] = useState(false)

	const openModal = () => setIsModalOpen(true)
	const closeModal = useCallback(() => setIsModalOpen(false), [])

	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [tokenToDelete, setTokenToDelete] = useState(null)

	const openDeleteModal = token => {
		setTokenToDelete(token)
		setDeleteModalOpen(true)
	}

	const closeDeleteModal = () => {
		setTokenToDelete(null)
		setDeleteModalOpen(false)
	}

	const handleDelete = useCallback(() => {
		deleteToken(tokenToDelete.id)
			.then(() => {
				setTokens(tokens.filter(token => token.id !== tokenToDelete.id))
				toast.success('Token deleted successfully')
				closeDeleteModal()
			})
			.catch(error => {
				toast.error('Error deleting token: ' + error.message)
				closeDeleteModal()
			})
	}, [tokenToDelete, tokens, closeDeleteModal])

	useEffect(() => {
		getAllToken().then(setTokens)
	}, [])

	return (
		<div className="w-full">
			<TokenModal
				closeModal={closeModal}
				isOpen={isModalOpen}
				setTokens={setTokens}
				tokens={tokens}
			/>
			<TokenModalDelete
				closeModal={closeDeleteModal}
				isOpen={deleteModalOpen}
				onConfirm={handleDelete}
				token={tokenToDelete}
			/>
			<div className="sm:flex sm:items-center">
				<div className="sm:flex-auto">
					<p className="mt-2 text-sm text-slate-700">
						A list of all the tokens you have created. You can create a new
						token, and delete existing ones.
					</p>
				</div>
				<div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
					<button
						className="block rounded-md bg-forvoyez_orange-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-forvoyez_orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-600"
						data-testid="add-token-button"
						onClick={openModal}
						type="button"
					>
						Add token
					</button>
				</div>
			</div>
			<div className="min-w-7xl mt-8 flex max-w-7xl items-center justify-center shadow-sm">
				<div className={'min-w-7xl w-full max-w-7xl overflow-x-auto'}>
					<div className="align-middle">
						<div className="ring-1 ring-black ring-opacity-5">
							<table className="m-0 divide-y divide-slate-300">
								<thead className="bg-slate-50">
									<tr>
										<th
											className="w-3/12 overflow-x-auto py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6"
											scope="col"
										>
											Token name
										</th>
										<th
											className="w-3/12 overflow-x-auto py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6"
											scope="col"
										>
											Token value
										</th>
										<th
											className="w-2/12 px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
											scope="col"
										>
											Created at
										</th>
										<th
											className="w-2/12 px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
											scope="col"
										>
											Expired at
										</th>
										<th
											className="relative w-2/12 py-3.5 pl-3 pr-4 sm:pr-6"
											scope="col"
										>
											<span className="sr-only">Actions</span>
										</th>
									</tr>
								</thead>
								<tbody className="w-full divide-y divide-slate-200 bg-white">
									{
										// map over tokens and display them in a table
										tokens && tokens.length > 0 ? (
											tokens.map((token, index) => (
												<tr data-testid={`token-row-${index}`} key={index}>
													<td className="overflow-x-visible whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
														{
															// display token name, and truncate if too long
															token.name
														}
													</td>
													<td className="overflow-x-visible whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
														{token.jwt}
													</td>
													<td className="whitespace-nowrap py-4 text-sm font-medium text-slate-900">
														{
															// display token creation date, and time, format it too
															new Date(token.createdAt).toLocaleString(
																'en-US',
																{
																	minute: 'numeric',
																	second: 'numeric',
																	year: 'numeric',
																	hour: 'numeric',
																	month: 'short',
																	day: 'numeric',
																	hour12: true,
																}
															)
														}
													</td>
													<td className="whitespace-nowrap py-4 text-sm font-medium text-slate-900">
														{
															// display token expiration date, and format it
															new Date(token.expiredAt).toLocaleString(
																'en-US',
																{
																	minute: 'numeric',
																	second: 'numeric',
																	year: 'numeric',
																	hour: 'numeric',
																	month: 'short',
																	day: 'numeric',
																	hour12: true,
																}
															)
														}
													</td>
													<td className="relative flex justify-end whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
														<button
															className="text-forvoyez_orange-600 hover:text-forvoyez_orange-900"
															data-testid={`delete-token-button-${index}`}
															onClick={() => openDeleteModal(token)}
														>
															Delete
														</button>
													</td>
												</tr>
											))
										) : (
											<tr>
												<td className="py-4 pl-4 pr-3 text-sm font-medium italic text-slate-900 sm:pl-6">
													No tokens found, create one, and it will appear here
												</td>
												<td></td>
												<td></td>
												<td></td>
											</tr>
										)
									}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
