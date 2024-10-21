import { useState } from 'react'

import { CheckIcon, ClipboardIcon } from '@heroicons/react/20/solid'
import { Tab } from '@headlessui/react'

import { getPreviewCode } from '@/components/Playground/GetPreviewCode'

export default function PlaygroundPreviewCode(params) {
	const previewLanguages = ['HTTP', 'cURL', 'JavaScript', 'PHP', 'Python']

	const [selectedTab, setSelectedTab] = useState(previewLanguages[0])

	const [isPreviewCopied, setIsPreviewCopied] = useState(false)

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

	return (
		<div className={'flex flex-col'}>
			<h3>Request Preview</h3>
			<p className="mt-1 text-sm italic text-slate-500">
				{`This section shows a preview of the request that will be sent to the API when you click the "Analyze your image" button. It includes the HTTP method, API URL, request headers, and the request body containing the selected image, additional context, and JSON schema.`}
			</p>

			<div className="hidden sm:block">
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
										{getPreviewCode(
											params.languageToTranslate,
											language,
											params.image,
											params.context,
											params.jsonSchema,
											formatJsonSchema
										)}
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
