'use client'
import { CheckIcon, ClipboardIcon } from '@heroicons/react/20/solid'
import { Disclosure, Tab } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

import Prism from 'prismjs'

import { getPreviewCode } from '@/components/Playground/GetPreviewCode'
import copyToClipboard from '@/helpers/copyToClipboard'

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
	const [disclosureOpen, setDisclosureOpen] = useState(false)

	// Utiliser useEffect pour Prism et éviter les problèmes d'hydratation ( vite fait, marche pas bien)
	useEffect(() => {
		Prism.highlightAll()
	}, [selectedTab, params, disclosureOpen])

	// the generated code, not the highlighted element: the cURL tab is
	// rendered as `language-bash`, so looking up `language-curl` found nothing
	const copySelectedEditorContent = () => {
		copyToClipboard(getPreviewCode(selectedTab, params.formData))
		setIsPreviewCopied(true)
		setTimeout(() => setIsPreviewCopied(false), 2000)
	}

	return (
		<Disclosure as="div" className="hidden sm:block" key="code preview">
			{({ open }) => {
				setDisclosureOpen(open)

				return (
					<>
						<dt>
							<Disclosure.Button className="flex w-full items-baseline text-left text-gray-900">
								<h3>Request Preview</h3>
								<span className="ml-6 flex h-7 items-center">
									<motion.svg
										animate={{ rotate: open ? 180 : 0 }}
										className="h-6 w-6"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										viewBox="0 0 24 24"
									>
										<path
											d="M19 9l-7 7-7-7"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</motion.svg>
								</span>
							</Disclosure.Button>
						</dt>
						<Disclosure.Panel as="dd" className="mt-2 pr-12 pl-0">
							<motion.p
								animate={{ opacity: 1, y: 0 }}
								className="text-base leading-7 text-gray-600"
								exit={{ opacity: 0, y: -10 }}
								initial={{ opacity: 0, y: -10 }}
							>
								<div className={'flex hidden flex-col sm:block'}>
									<p className="mt-1 text-sm text-slate-500 italic">
										{`This section shows the same request made to the API from your own server, with one of your API keys in place of YOUR_API_KEY. It sends the selected image, context, keywords, language and JSON schema as multipart/form-data.`}
									</p>

									<div className="">
										<Tab.Group
											data-testid="language-tabs"
											onChange={index =>
												setSelectedTab(previewLanguages[index])
											}
										>
											<Tab.List className="flex">
												{previewLanguages.map(language => (
													<Tab
														className={({ selected }) =>
															selected
																? 'border-forvoyez_orange-500 text-forvoyez_orange-600 w-1/4 border-b-2 px-1 py-4 text-center text-sm font-medium'
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
														<div className="relative mt-2 w-full overflow-hidden border-0 text-slate-900">
															<pre
																className={`language-${language.toLowerCase() === 'curl' ? 'bash' : language.toLowerCase()} rounded-md`}
															>
																<code
																	className={`language-${language.toLowerCase() === 'curl' ? 'bash' : language.toLowerCase()}`}
																>
																	{getPreviewCode(language, params.formData)}
																</code>
															</pre>
															<button
																className="focus:ring-forvoyez_orange-500 absolute top-3 right-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 focus:ring-2 focus:outline-hidden"
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
							</motion.p>
						</Disclosure.Panel>
					</>
				)
			}}
		</Disclosure>
	)
}
