'use client'
import { useEffect, useRef, useState } from 'react' // import MonacoEditor from 'react-monaco-editor'
import { describePlaygroundAction } from '@/app/actions/app/playground'
import { CheckIcon, ClipboardIcon } from '@heroicons/react/20/solid'
import { Tab } from '@headlessui/react'
import Link from 'next/link'

import PlaygroundPreviewCode from '@/components/Playground/PlaygroundPreviewCode.component'
import PlaygroundForm from '@/components/Playground/PlaygroundForm.component'
import { LoadAnimation } from '@/components/Playground/LoadAnimation'
import { defaultJsonTemplateSchema } from '@/constants/playground'
import { getCreditsFromUserId } from '@/services/database.service'

export function Playground() {
	const [userCredits, setUserCredits] = useState(0)
	const [showTooltip, setShowTooltip] = useState(false)

	const [isResponseCopied, setIsResponseCopied] = useState(false)

	const [isProcessingResultApi, setIsProcessingResultApi] = useState(false)
	const [languageToTranslate, setLanguageToTranslate] = useState('')
	const [image, setImage] = useState(null)

	const [context, setContext] = useState('')

	const [jsonSchema, setJsonSchema] = useState('')
	const [response, setResponse] = useState(
		'Waiting for an image to be analyzed... Please upload an image and click the Analyze your image button.'
	)
	const responseRef = useRef(null)
	const apiResponseRef = useRef(null)

	const handleSubmit = async e => {
		e.preventDefault()

		if (!image) {
			setUploadError('Please select an image')
			return
		}

		// 10 * 1024 * 1024
		if (imageSize > 10485760) {
			setUploadError('Image size should not exceed 10MB')
			return
		}

		const formData = new FormData()
		formData.append('image', image)
		const dataObject = {
			schema: jsonSchema || defaultJsonTemplateSchema,
			language: languageToTranslate,
			context: context,
		}

		formData.append('data', JSON.stringify(dataObject))

		setIsProcessingResultApi(true)
		apiResponseRef.current?.scrollIntoView({ behavior: 'smooth' })

		try {
			const response = await describePlaygroundAction(formData)
			if (response.status === 200) {
				setResponse(response.data)
			} else {
				setResponse('Error processing the request. Please try again.')
			}
		} catch (error) {
			console.error('Error:', error)
			setResponse(
				'An error occurred. Please check the console for more details.'
			)
		} finally {
			setIsProcessingResultApi(false)
		}
	}

	const copyToClipboard = content => {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(content).catch(err => {
				console.error('Failed to copy:', err)
			})
		} else {
			// Fallback to older execCommand approach
			const textarea = document.createElement('textarea')
			textarea.value = content
			document.body.appendChild(textarea)
			textarea.select()
			try {
				document.execCommand('copy')
			} catch (err) {
				console.error('Failed to copy with execCommand:', err)
			}
			document.body.removeChild(textarea)
		}
	}

	useEffect(() => {
		// get the value for defaultJsonTemplateSchema from the constants file
		// then, set a '\n' at the second and last - 1 character
		const value = JSON.stringify(defaultJsonTemplateSchema, null, 4)
		setJsonSchema(value)
	}, [])

	useEffect(() => {
		getCreditsFromUserId().then(credits => setUserCredits(credits))
	}, [])

	useEffect(() => {
		if (userCredits === 0) {
			setShowTooltip(true)
		} else {
			setShowTooltip(false)
		}
	}, [userCredits])

	return (
		<>
			{showTooltip && (
				<div
					className="not-prose pointer-events-none fixed inset-x-0 bottom-0 z-50 sm:flex sm:justify-center sm:px-6 sm:pb-5 lg:px-8"
					data-testid="tooltip"
				>
					<div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-gray-900 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
						<p className="text-sm leading-6 text-white">
							<Link data-testid="tooltip-link" href="/app/plans">
								<strong className="font-semibold">Playground usage</strong>
								<svg
									aria-hidden="true"
									className="mx-2 inline h-0.5 w-0.5 fill-current"
									viewBox="0 0 2 2"
								>
									<circle cx="1" cy="1" r="1" />
								</svg>
								You need to have at least 1 credit to use the playground, get a
								plan before&nbsp;
								<span aria-hidden="true">&rarr;</span>
							</Link>
						</p>
					</div>
				</div>
			)}
			<div className="grid-col-1 grid gap-8 xl:grid-cols-2">
				<PlaygroundForm
					context={context}
					handleSubmit={handleSubmit}
					image={image}
					jsonSchema={jsonSchema}
					languageToTranslate={languageToTranslate}
					setContext={setContext}
					setImage={setImage}
					setJsonSchema={setJsonSchema}
					setLanguageToTranslate={setLanguageToTranslate}
					userCredits={userCredits}
				/>

				{/* ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */}

				<div className="flex hidden flex-col sm:block">
					<Tab.Group data-testid="playgrounds-tabs">
						<Tab.List className="flex">
							<Tab
								className={({ selected }) =>
									selected
										? 'w-1/4 border-b-2 border-forvoyez_orange-500 px-1 py-4 text-center text-sm font-medium text-forvoyez_orange-600'
										: 'w-1/4 border-b-2 border-transparent px-1 py-4 text-center text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700'
								}
								data-testid={`tab-result`}
								key={'Result'}
							>
								Result
							</Tab>
							<Tab
								className={({ selected }) =>
									selected
										? 'w-1/4 border-b-2 border-forvoyez_orange-500 px-1 py-4 text-center text-sm font-medium text-forvoyez_orange-600'
										: 'w-1/4 border-b-2 border-transparent px-1 py-4 text-center text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700'
								}
								data-testid={`tab-result`}
								key={'CodePreview'}
							>
								Code Preview
							</Tab>
						</Tab.List>
						<Tab.Panels>
							<Tab.Panel key={'Result'}>
								<div className="relative mt-2 w-full overflow-hidden rounded-md border-0 py-2.5 pl-0.5 pr-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300">
									<div
										className={'flex hidden flex-col sm:block'}
										ref={apiResponseRef}
									>
										<h3>API Response</h3>
										<p className="mt-1 text-sm italic text-slate-500">
											{`This section displays the response received from the API after submitting the request. It will show the generated title, alternative text, and caption for the analyzed image based on the provided image, context, and JSON schema.`}
										</p>

										{isProcessingResultApi ? (
											<LoadAnimation />
										) : (
											<div
												className="relative mt-2 w-full overflow-hidden rounded-md border-0 py-2.5 pl-0.5 pr-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300"
												data-testid="response-editor"
											>
												{JSON.stringify(response, null, 4)}
												<button
													className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-forvoyez_orange-500"
													data-testid="response-copy-button"
													onClick={() => {
														copyToClipboard(JSON.stringify(response, null, 4))
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
								</div>
							</Tab.Panel>

							<Tab.Panel key={'CodePreview'}>
								<div className="relative mt-2 w-full overflow-hidden rounded-md border-0 py-2.5 pl-0.5 pr-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300">
									<PlaygroundPreviewCode
										context={context}
										image={image}
										jsonSchema={jsonSchema}
										languageToTranslate={languageToTranslate}
									/>
								</div>
							</Tab.Panel>
						</Tab.Panels>
					</Tab.Group>
				</div>
			</div>
		</>
	)
}
