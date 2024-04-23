import { auth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { createToken, getAllToken } from '@/components/tokens/TokensCRUD'
// import toastify

import { ToastContainer, toast } from 'react-toastify'

export default function TokenList({ tokens, setTokens }) {
	useEffect(() => {
		getAllToken().then(r => setTokens(r))
	}, [])

	return (
		<>
			{tokens &&
				tokens.map((token, index) => (
					<div key={index} className="mb-2 mr-2 flex flex-col border p-4">
						<p>Name: {token.name}</p>
						<p>Created at: {token.createdAt.toString()}</p>
						<p>Expires at: {token.expiredAt.toString()}</p>
						<button
							// onClick={() => handleModal(() => deleteToken(index))}
							className="mt-2 rounded bg-red-500 px-4 py-2 text-white"
						>
							Delete
						</button>
					</div>
				))}
		</>
	)
}
