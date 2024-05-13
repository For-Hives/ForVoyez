'use client'
import { useState } from 'react'

import TokenList from '@/components/Tokens/TokenList'
import 'react-toastify/dist/ReactToastify.css'

export const metadata = {
	title: 'API Tokens - ForVoyez',
	description:
		'Generate, manage, and revoke your ForVoyez API tokens to securely access our image metadata generation services.',
	alternates: {
		canonical: '/app/tokens',
	},
}

export default function TokenPage() {
	const [tokens, setTokens] = useState([])

	return (
		<div className={'prose mx-auto max-w-5xl flex-auto'}>
			<h1 className="text-xl font-bold text-slate-800">Manage Tokens</h1>
			<div className="mb-8 w-full">
				<TokenList tokens={tokens} setTokens={setTokens} />
			</div>
		</div>
	)
}
