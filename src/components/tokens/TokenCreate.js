import { useState } from 'react'
import { createToken } from '@/app/actions/tokens/TokensCRUD'
import { toast } from 'react-toastify'
import JwtModal from '@/components/tokens/JwtModal'

export default function TokenCreate({ tokens, setTokens }) {
	const [newTokenName, setNewTokenName] = useState('')
	const [newTokenExpiry, setNewTokenExpiry] = useState('')
	const [jwtModalOpen, setJwtModalOpen] = useState(false)
	const [jwtToken, setJwtToken] = useState('')

	const showToast = message => {
		toast(message, {
			position: 'top-right',
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			zIndex: 9999,
		})
	}

	const showJwtModal = jwt => {
		setJwtToken(jwt)
		setJwtModalOpen(true)
	}

	async function create() {
		if (!newTokenExpiry || new Date(newTokenExpiry) < new Date()) {
			showToast('Please provide a valid future expiry date.')
			return
		}

		const newToken = {
			name: newTokenName,
			createdAt: new Date().toISOString(),
			expiredAt: new Date(newTokenExpiry).toISOString(),
		}

		try {
			const result = await createToken(newToken)
			if (result.jwt) {
				showJwtModal(result.jwt)
			}
			setTokens([...tokens, { ...newToken, id: result.id }]) // Assume response contains id.
			setNewTokenName('')
			setNewTokenExpiry('')
			showToast('Token successfully created.')
		} catch (error) {
			showToast('Error creating token.')
		}
	}

	return (
		<div className="mb-4 flex items-center justify-center rounded-lg bg-white p-4 shadow">
			<input
				type="text"
				placeholder="Token Name"
				value={newTokenName}
				onChange={e => setNewTokenName(e.target.value)}
				className="mb-4 mr-2 w-full rounded border p-2"
			/>
			<input
				type="date"
				value={newTokenExpiry}
				onChange={e => setNewTokenExpiry(e.target.value)}
				className="mb-4 mr-2 w-full rounded border p-2"
			/>
			<button
				onClick={create}
				className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
			>
				Create Token
			</button>

			{jwtModalOpen && (
				<JwtModal jwtToken={jwtToken} setJwtModalOpen={setJwtModalOpen} />
			)}
		</div>
	)
}
