'use client'
import { useState } from 'react'
import TokenCreate from '@/components/tokens/TokenCreate'
import TokenList from '@/components/tokens/TokenList'
import 'react-toastify/dist/ReactToastify.css'

export default function TokenPage() {
	const [tokens, setTokens] = useState([])

	return (
		<div className={'prose mx-auto max-w-5xl flex-auto'}>
			<h1 className=" text-xl font-bold text-slate-800">Manage Tokens</h1>
			<div className="mb-8 w-full">
				<TokenList tokens={tokens} setTokens={setTokens} />
			</div>
			<div className="mb-8 w-full">
				<TokenCreate tokens={tokens} setTokens={setTokens} />
			</div>
		</div>
	)
}
