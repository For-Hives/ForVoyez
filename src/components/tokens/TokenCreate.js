import { auth } from '@clerk/nextjs'
import { useState } from 'react'
import { createToken } from '@/components/tokens/TokensCRUD'
// import toastify

import { ToastContainer, toast } from 'react-toastify'

export default function TokenCreate({ tokens, setTokens }) {
	const [newTokenName, setNewTokenName] = useState('')
	const [newTokenExpiry, setNewTokenExpiry] = useState('')

	const showToast = message => {
		// use tostify for the alert
		toast('Wow so easy!')
	}

	async function create() {
		if (!newTokenExpiry || new Date(newTokenExpiry) < new Date()) {
			// todo : penser a check que la date d'expiration est bien utiliser
			showToast('Please provide a valid expiry date in the future.')
			return
		}

		const newToken = {
			name: newTokenName,
			createdAt: new Date().toISOString(),
			expiredAt: new Date(newTokenExpiry).toISOString(),
		}

		console.log(newToken)

		const result = await createToken(newToken)
		console.table(result)

		setTokens([...tokens, newToken])
		setNewTokenName('')
		setNewTokenExpiry('')
		showToast('Token created successfully!')
	}

	return (
		<div className="mb-4">
			<input
				type="text"
				placeholder="New token name"
				value={newTokenName}
				onChange={e => setNewTokenName(e.target.value)}
				className="mr-2 border p-2"
			/>
			<input
				type="date"
				value={newTokenExpiry}
				onChange={e => setNewTokenExpiry(e.target.value)}
				className="mr-2 border p-2"
			/>
			<button
				onClick={create}
				className="rounded bg-blue-500 px-4 py-2 text-white"
			>
				Create Token
			</button>
		</div>
	)
}
