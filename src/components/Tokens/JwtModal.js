import { toast } from 'react-toastify'

export default function JwtModal({ setJwtModalOpen, jwtToken }) {
	const copyToClipboard = () => {
		navigator.clipboard.writeText(jwtToken)
		toast.success('Token has been copied to clipboard')
		setJwtModalOpen(false)
	}

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-slate-600 bg-opacity-50">
			<div className="w-3/4 rounded-lg bg-white p-8 shadow-lg">
				<h2 className="text-lg font-semibold">Your JWT Token</h2>
				<div className="relative mb-4 mt-4 w-full">
					<pre className="overflow-x-auto rounded bg-slate-100 p-2 text-sm text-slate-800">
						<code>{jwtToken}</code>
					</pre>
					<button
						className="absolute right-1 top-1 rounded bg-blue-500 p-2 text-white hover:bg-blue-700"
						onClick={copyToClipboard}
						title="Copier le token"
					>
						<svg
							className="h-6 w-6"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M8 5H5a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-3M15 2h6v6m-3-3v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h9z"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	)
}
