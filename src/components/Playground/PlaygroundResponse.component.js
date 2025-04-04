import { CheckIcon, ClipboardIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

import { LoadAnimation } from '@/components/Playground/LoadAnimation'
import copyToClipboard from '@/helpers/copyToClipboard'

export default function PlaygroundResponse(props) {
	const [isResponseCopied, setIsResponseCopied] = useState(false)

	return (
		<div className="">
			{props.processingResultApi ? (
				<LoadAnimation />
			) : (
				<div
					className="relative mt-2 w-full overflow-hidden rounded-md border-0 px-4 py-2.5 pr-2.5 text-slate-900 ring-1 shadow-xs ring-slate-300 ring-inset"
					data-testid="response-editor"
				>
					{props.response && JSON.stringify(props.response, null, 4)}
					{props.response == null && 'No response yet.'}

					<button
						className="focus:ring-forvoyez_orange-500 absolute top-2 right-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 focus:ring-2 focus:outline-hidden"
						data-testid="response-copy-button"
						onClick={() => {
							copyToClipboard(JSON.stringify(props.response, null, 4))
							setIsResponseCopied(true)
							setTimeout(() => setIsResponseCopied(false), 2000)
						}}
					>
						{isResponseCopied ? (
							<CheckIcon className="h-5 w-5 text-green-500" />
						) : (
							<ClipboardIcon className="h-5 w-5" />
						)}
					</button>
				</div>
			)}
		</div>
	)
}
