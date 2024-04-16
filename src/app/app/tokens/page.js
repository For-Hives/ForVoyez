'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import TokenCreate from '@/components/tokens/TokenCreate'
import { auth } from '@clerk/nextjs'

export default function TokenPage() {
	const [tokens, setTokens] = useState([])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalContent, setModalContent] = useState('')
	const [modalAction, setModalAction] = useState(() => () => {})

	const showToast = message => {
		alert(message) // Replace with a toast notification library if available
	}

	const handleModal = action => {
		setIsModalOpen(true)
		setModalContent('Are you sure you want to delete this token?')
		setModalAction(() => action)
	}

	const deleteToken = index => {
		const updatedTokens = tokens.filter((_, i) => i !== index)
		setTokens(updatedTokens)
		setIsModalOpen(false)
	}

	return (
		<>
			<Navbar />
			<div className="p-8">
				<h1 className="mb-4 text-xl font-bold">Token Management</h1>
				<div className="flex flex-wrap">
					{tokens &&
						tokens.map((token, index) => (
							<div key={index} className="mb-2 mr-2 flex flex-col border p-4">
								<p>Name: {token.name}</p>
								<p>Created at: {token.createdAt}</p>
								<p>Expires at: {token.expiredAt}</p>
								<button
									onClick={() => handleModal(() => deleteToken(index))}
									className="mt-2 rounded bg-red-500 px-4 py-2 text-white"
								>
									Delete
								</button>
							</div>
						))}
				</div>
				<TokenCreate tokens={tokens} setTokens={setTokens} />
				{isModalOpen && (
					<div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
						<div className="bg-white p-8">
							<p>{modalContent}</p>
							<button
								onClick={modalAction}
								className="mr-4 rounded bg-green-500 px-4 py-2 text-white"
							>
								Yes
							</button>
							<button
								onClick={() => setIsModalOpen(false)}
								className="rounded bg-red-500 px-4 py-2 text-white"
							>
								No
							</button>
						</div>
					</div>
				)}
			</div>
		</>
	)
}
