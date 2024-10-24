import { useEffect, useState } from 'react'

import { CheckIcon, ClipboardIcon } from '@heroicons/react/20/solid'
import { Tab } from '@headlessui/react'
import Prism from 'prismjs'

import { getPreviewCode } from '@/components/Playground/GetPreviewCode'

import 'prismjs/components/prism-markup-templating'
import 'prismjs/themes/prism-tomorrow.min.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-http'
import 'prismjs/components/prism-php'

export default function PlaygroundPreviewCode(params) {
	const previewLanguages = ['JavaScript', 'cURL', 'Python', 'PHP', 'HTTP']
	const [selectedTab, setSelectedTab] = useState(previewLanguages[0])
	const [isPreviewCopied, setIsPreviewCopied] = useState(false)
	const [mounted, setMounted] = useState(false) // Pour savoir si le composant est monté

	// Utiliser useEffect pour Prism et éviter les problèmes d'hydratation
	useEffect(() => {
		setMounted(true) // Assure que le composant est monté avant l'application de Prism.js
		if (mounted) {
			Prism.highlightAll()
		}
	}, [mounted, selectedTab, params])

	const formatJsonSchema = jsonSchema => {
		if (!jsonSchema || jsonSchema.trim() === '') {
			return 'No schema provided'
		}
		try {
			const parsedJsonSchema = JSON.parse(jsonSchema)
			return JSON.stringify(parsedJsonSchema, null, 4)
				.replace(/\n/g, '\n    ')
				.replace(/\n    \}/g, '\n    }\n')
		} catch (error) {
			return 'Invalid JSON'
		}
	}

	const copySelectedEditorContent = () => {
		const content = getSelectedEditorContent()
		copyToClipboard(content)
		setIsPreviewCopied(true)
		setTimeout(() => setIsPreviewCopied(false), 2000)
	}

	if (!mounted) {
		return null // Pendant le SSR, ne retourne rien
	}

	return (
		<div className={'flex hidden flex-col sm:block'}>
			<h3>Request Preview</h3>
			<p className="mt-1 text-sm italic text-slate-500">
				{`This section shows a preview of the request that will be sent to the API when you click the "Analyze your image" button. It includes the HTTP method, API URL, request headers, and the request body containing the selected image, additional context, and JSON schema.`}
			</p>

			<div className="">
				<div className="border-b border-slate-200">
					<Tab.Group
						data-testid="language-tabs"
						onChange={index => setSelectedTab(previewLanguages[index])}
					>
						<Tab.List className="flex">
							{previewLanguages.map(language => (
								<Tab
									className={({ selected }) =>
										selected
											? 'w-1/4 border-b-2 border-forvoyez_orange-500 px-1 py-4 text-center text-sm font-medium text-forvoyez_orange-600'
											: 'w-1/4 border-b-2 border-transparent px-1 py-4 text-center text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700'
									}
									data-testid={`tab-${language.toLowerCase()}`}
									key={language}
								>
									{language}
								</Tab>
							))}
						</Tab.List>
						<Tab.Panels>
							{previewLanguages.map((language, index) => (
								<Tab.Panel key={language}>
									<div className="relative mt-2 w-full overflow-hidden rounded-md border-0 py-2.5 pl-0.5 pr-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300">
										<pre
											className={`language-${language.toLowerCase() === 'curl' ? 'bash' : language.toLowerCase()} rounded-md`}
										>
											<code
												className={`language-${language.toLowerCase() === 'curl' ? 'bash' : language.toLowerCase()}`}
											>
												{getPreviewCode(
													params.languageToTranslate,
													language,
													params.image,
													params.context,
													params.jsonSchema,
													formatJsonSchema
												)}
											</code>
										</pre>
										<button
											className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-forvoyez_orange-500"
											data-testid="copy-button"
											onClick={copySelectedEditorContent}
										>
											{isPreviewCopied ? (
												<CheckIcon className="h-5 w-5 text-green-500" />
											) : (
												<ClipboardIcon className="h-5 w-5" />
											)}
										</button>
									</div>
								</Tab.Panel>
							))}
						</Tab.Panels>
					</Tab.Group>
				</div>
			</div>
		</div>
	)
}
