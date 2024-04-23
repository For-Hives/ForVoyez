import { toast } from 'react-toastify'

export default function JwtModal({ jwtToken, setJwtModalOpen }) {
	const copyToClipboard = () => {
		navigator.clipboard.writeText(jwtToken)
		toast.success('Token has been copied to clipboard')
		setJwtModalOpen(false)
	}

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50  ">
			<div className="w-3/4 rounded-lg bg-white p-8 shadow-lg ">
				<h2 className="text-lg font-semibold">Your JWT Token</h2>
				<div className="relative mb-4 mt-4 w-full">
					<pre className="overflow-x-auto rounded bg-gray-100 p-2 text-sm text-gray-800 ">
						<code>{jwtToken}</code>
					</pre>
					<button
						onClick={copyToClipboard}
						className="absolute right-1 top-1 rounded bg-blue-500 p-2 text-white hover:bg-blue-700"
						title="Copier le token"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
							className="h-6 w-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8 5H5a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-3M15 2h6v6m-3-3v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h9z"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	)
}
