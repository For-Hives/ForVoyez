import TokenList from '@/components/Tokens/TokenList'
import { Transition } from '@/components/Transitions/Transition.component'

export const metadata = {
	description:
		'Securely manage your ForVoyez API keys. Create new tokens, revoke existing ones, and monitor key usage all in one place.',
	title: 'API Keys Management',
}

export default function TokenPage() {
	return (
		<div className={'prose mx-auto max-w-5xl flex-auto'}>
			<Transition name="resource-tokens-title">
				<h1 className="text-xl font-bold text-slate-800">Manage Tokens</h1>
			</Transition>
			<div className="mb-8 w-full">
				<TokenList />
			</div>
		</div>
	)
}
