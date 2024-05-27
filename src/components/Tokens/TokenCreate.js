import { toast } from 'react-toastify'
import { useState } from 'react'

import { createToken } from '@/app/actions/tokens/TokensCRUD'

import JwtModal from '@/components/Tokens/JwtModal'

export default function TokenCreate({ setTokens, tokens }) {
	const [newTokenName, setNewTokenName] = useState('')
	const [newTokenExpiry, setNewTokenExpiry] = useState('')
	const [jwtModalOpen, setJwtModalOpen] = useState(false)
	const [jwtToken, setJwtToken] = useState('')

	const showToast = message => {
		toast(message, {
			hideProgressBar: false,
			position: 'top-right',
			progress: undefined,
			closeOnClick: true,
			pauseOnHover: true,
			autoClose: 3000,
			draggable: true,
			zIndex: 9999,
		})
	}

	async function create() {
		if (!newTokenExpiry || new Date(newTokenExpiry) < new Date()) {
			showToast('Please provide a valid future expiry date.')
			return
		}

		const newToken = {
			expiredAt: new Date(newTokenExpiry).toISOString(),
			createdAt: new Date().toISOString(),
			name: newTokenName,
		}

		try {
			const result = await createToken(newToken)
			setTokens([...tokens, { ...newToken, jwt: result.jwt, id: result.id }])
			setNewTokenName('')
			setNewTokenExpiry('')
			setJwtToken(result.jwt)
			setJwtModalOpen(true)
			showToast('Token successfully created.')
		} catch (error) {
			showToast('Error creating token.')
		}
	}

	return (
		<div className="mb-4 flex items-center justify-center rounded-lg bg-white p-4 shadow">
			<input
				className="mb-4 mr-2 w-full rounded border p-2"
				onChange={e => setNewTokenName(e.target.value)}
				placeholder="Token Name"
				type="text"
				value={newTokenName}
			/>
			<input
				className="mb-4 mr-2 w-full rounded border p-2"
				onChange={e => setNewTokenExpiry(e.target.value)}
				type="date"
				value={newTokenExpiry}
			/>
			<button
				className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				onClick={create}
			>
				Create Token
			</button>

			{jwtModalOpen && (
				<JwtModal jwtToken={jwtToken} setJwtModalOpen={setJwtModalOpen} />
			)}
		</div>
	)
}
