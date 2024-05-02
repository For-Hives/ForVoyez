'use client'
import { useState } from 'react'
import TokenCreate from '@/components/tokens/TokenCreate'
import TokenList from '@/components/tokens/TokenList'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function TokenPage() {
	const [tokens, setTokens] = useState([])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalContent, setModalContent] = useState('')
	const [modalAction, setModalAction] = useState(() => () => {})

	// const showToast = message => {
	// 	toast.info(message)
	// }

	// const handleModal = action => {
	// 	setIsModalOpen(true)
	// 	setModalContent('Êtes-vous sûr de vouloir supprimer ce token ?')
	// 	setModalAction(() => action)
	// }
	//
	// const deleteToken = index => {
	// 	const updatedTokens = tokens.filter((_, i) => i !== index)
	// 	setTokens(updatedTokens)
	// 	setIsModalOpen(false)
	// 	showToast('Token supprimé avec succès')
	// }

	return (
		<div className={'prose mx-auto max-w-5xl flex-auto'}>
			<h1 className=" text-xl font-bold text-slate-800">Manage Tokens</h1>
			<div className="mb-8 w-full">
				<TokenList tokens={tokens} setTokens={setTokens} />
			</div>
			<div className="mb-8 w-full">
				<TokenCreate tokens={tokens} setTokens={setTokens} />
			</div>
			{isModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center bg-slate-600 bg-opacity-50">
					<div className="rounded-lg bg-white p-8 shadow-lg">
						<p className="mb-4">{modalContent}</p>
						<button
							onClick={modalAction}
							className="mr-4 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
						>
							Yes
						</button>
						<button
							onClick={() => setIsModalOpen(false)}
							className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
						>
							No
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
