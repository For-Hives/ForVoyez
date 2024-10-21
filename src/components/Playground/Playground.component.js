'use client'
import { useEffect, useRef, useState } from 'react'

// import MonacoEditor from 'react-monaco-editor'
import { describePlaygroundAction } from '@/app/actions/app/playground'
import { CheckIcon, ClipboardIcon } from '@heroicons/react/20/solid'
import { Tab } from '@headlessui/react'
import Link from 'next/link'

import { getPreviewCode } from '@/components/Playground/GetPreviewCode'
import { LoadAnimation } from '@/components/Playground/LoadAnimation'
import { defaultJsonTemplateSchema } from '@/constants/playground'
import { getCreditsFromUserId } from '@/services/database.service'

export function Playground() {
	const previewLanguages = ['HTTP', 'cURL', 'JavaScript', 'PHP', 'Python']

	const [userCredits, setUserCredits] = useState(0)
	const [showTooltip, setShowTooltip] = useState(false)

	const [selectedTab, setSelectedTab] = useState(previewLanguages[0])

	const [isPreviewCopied, setIsPreviewCopied] = useState(false)
	const [isResponseCopied, setIsResponseCopied] = useState(false)

	const [isProcessingResultApi, setIsProcessingResultApi] = useState(false)
	const [isJsonValid, setIsJsonValid] = useState(true)

	const [requestPreviewValue] = useState('')
	const [image, setImage] = useState(null)
	const [imagePreview, setImagePreview] = useState(null)
	const [imageSize, setImageSize] = useState(0)

	const [context, setContext] = useState('')
	const [languageToTranslate, setLanguageToTranslate] = useState('')
	const [jsonSchema, setJsonSchema] = useState('')
	const [response, setResponse] = useState(
		'Waiting for an image to be analyzed... Please upload an image and click the Analyze your image button.'
	)

	const [isDraggingOver, setIsDraggingOver] = useState(false)
	const [uploadError, setUploadError] = useState(null)

	const editorRef = useRef(null)
	const requestPreviewRefs = useRef([])
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

	const copySelectedEditorContent = () => {
		const content = getSelectedEditorContent()
		copyToClipboard(content)
		setIsPreviewCopied(true)
		setTimeout(() => setIsPreviewCopied(false), 2000)
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

	const resizeEditor = editor => {
		if (editor) {
			const contentHeight = editor.getContentHeight()
			editor.getContainerDomNode().style.height = `${contentHeight}px`
			editor.layout()
		}
	}

	const validateJson = json => {
		if (!json || json.trim() === '') {
			return true
		}
		try {
			JSON.parse(json)
			return true
		} catch (error) {
			return false
		}
	}

	const handleImageChange = e => {
		const file = e.target.files[0]
		if (file && isValidFileType(file)) {
			setImage(file)
			setImagePreview(URL.createObjectURL(file))
			setImageSize(file.size)
			setUploadError(null)
		} else {
			setUploadError('Please select a valid image file (PNG, Webp, JPG, GIF)')
		}
	}

	const handleImageDrop = e => {
		e.preventDefault()
		setIsDraggingOver(false)
		const file = e.dataTransfer.files[0]
		if (file && isValidFileType(file)) {
			setImage(file)
			setImagePreview(URL.createObjectURL(file))
			setImageSize(file.size)
			setUploadError(null)
		} else {
			setUploadError('Please drop a valid image file (PNG, Webp, JPG, GIF)')
		}
	}

	const handleDragEnter = e => {
		e.preventDefault()
		setIsDraggingOver(true)
	}

	const handleDragLeave = e => {
		e.preventDefault()
		setIsDraggingOver(false)
	}

	const handleResetImage = () => {
		setImage(null)
		setImagePreview(null)
		setImageSize(0)
		setUploadError(null)
	}

	const isValidFileType = file => {
		const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
		return validTypes.includes(file.type)
	}

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

	const getSelectedEditorContent = () => {
		const selectedIndex = previewLanguages.indexOf(selectedTab)
		const editor = requestPreviewRefs.current[selectedIndex]
		if (editor) {
			return editor.getValue()
		}
		return ''
	}

	const handleEditorDidMount = (editor, index) => {
		requestPreviewRefs.current[index] = editor
		resizeEditor(editor)
	}

	const handleEditorChange = (value, editor) => {
		if (value.length > 1000) {
			editor.setValue(value.slice(0, 1000))
		} else {
			setJsonSchema(value)
		}
	}

	const determineTextColorBasedOnLength = (text, limit) => {
		const totalSize = text.length
		// 	if the current size is 50% of the limit, set the color to orange
		// 	if the current size is 80% of the limit, set the color to red
		// 	else set the color to slate
		if (totalSize > limit / 2) {
			if (totalSize > (limit * 4) / 5) {
				return 'text-red-600'
			}
			return 'text-orange-600'
		} else {
			return 'text-slate-600'
		}
	}

	useEffect(() => {
		const resizeAllEditors = () => {
			requestPreviewRefs.current.forEach(editor => {
				if (editor) {
					resizeEditor(editor)
				}
			})
		}

		const disposables = requestPreviewRefs.current.map(editor => {
			if (editor) {
				return editor.onDidChangeModelContent(resizeAllEditors)
			}
			return null
		})

		return () => {
			disposables.forEach(disposable => {
				if (disposable) {
					disposable.dispose()
				}
			})
		}
	}, [requestPreviewValue])

	useEffect(() => {
		setIsJsonValid(validateJson(jsonSchema))
	}, [jsonSchema])

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

	useEffect(() => {
		const editor = editorRef.current
		if (editor) {
			const resizeHandler = () => resizeEditor(editor)
			const disposable = editor.onDidChangeModelContent(resizeHandler)
			resizeEditor(editor)
			return () => disposable.dispose()
		}
	}, [])

	useEffect(() => {
		const responseEditor = responseRef.current
		if (responseEditor) {
			const resizeHandler = () => resizeEditor(responseEditor)
			const disposable = responseEditor.onDidChangeModelContent(resizeHandler)
			resizeEditor(responseEditor)
			return () => disposable.dispose()
		}
	}, [response])

	useEffect(() => {
		resizeEditor(responseRef.current)
	}, [response])

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
				<div className={'flex flex-col gap-4'}>
					<div>
						<h3>Image upload</h3>
						<label
							className="block text-sm font-medium leading-6 text-slate-900"
							htmlFor="image"
						>
							Your image
						</label>
						<p className="mt-1 text-sm italic text-slate-500">
							{`Upload an image to process with our API. The image should be in PNG, WEBP, 
							JPG, or GIF format and not exceed 10MB in size. You can either click
							the "Upload a file" button or drag and drop an image into the
							designated area.`}
						</p>
						<div
							className={`mt-2 flex w-full cursor-auto justify-center rounded-lg border border-dashed ${
								isDraggingOver
									? 'border-forvoyez_orange-600 bg-forvoyez_orange-50'
									: 'border-slate-900/25'
							}`}
							onDragEnter={handleDragEnter}
							onDragLeave={handleDragLeave}
							onDragOver={e => e.preventDefault()}
							onDrop={handleImageDrop}
							role={'button'}
						>
							{imagePreview ? (
								<div className={'relative'}>
									<img
										alt="Uploaded"
										className="max-h-48 rounded-lg"
										src={imagePreview}
									/>
									<button
										className="absolute -right-4 top-[1.25rem] rounded-full bg-forvoyez_orange-600 p-1 text-white shadow-md hover:bg-forvoyez_orange-500 focus:outline-none focus:ring-2 focus:ring-forvoyez_orange-500 focus:ring-offset-2"
										data-testid="reset-image"
										onClick={handleResetImage}
									>
										<svg
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M6 18L18 6M6 6l12 12"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
											/>
										</svg>
									</button>
								</div>
							) : (
								<label
									className="flex h-full w-full cursor-pointer flex-col items-center justify-center px-6 py-10 text-center"
									data-testid="upload-area"
									htmlFor="image"
								>
									<div>
										<svg
											aria-hidden="true"
											className="mx-auto h-12 w-12 text-slate-300"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												clipRule="evenodd"
												d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
												fillRule="evenodd"
											/>
										</svg>
										<div
											className={
												'm-0 flex items-center justify-center gap-1 p-0'
											}
										>
											<span className="text-sm font-semibold text-forvoyez_orange-600 hover:text-forvoyez_orange-500">
												Upload a file
											</span>
											<input
												className="sr-only"
												data-testid="upload-input"
												id="image"
												name="image"
												onChange={handleImageChange}
												type="file"
											/>
											<p className="m-0 p-0 text-sm text-slate-600">
												{isDraggingOver
													? 'Drop the image here'
													: 'or drag and drop'}
											</p>
										</div>
										<p className="m-0 p-0 text-center text-xs italic text-slate-600">
											(PNG, JPEG, WEBP, and non-animated GIF up to 10MB)
										</p>
									</div>
								</label>
							)}
						</div>
						{uploadError && (
							<p className="text-sm text-red-600">{uploadError}</p>
						)}
					</div>
					<div>
						<label
							className="block text-sm font-medium leading-6 text-slate-900"
							htmlFor="comment"
						>
							Add Your Context (Optional)
						</label>
						<p className="mt-1 text-sm italic text-slate-500">
							{`Provide additional context to help our API better understand and
							process your image. This can include information about the image
							content, specific requirements, or any other relevant details. The
							more context you provide, the more accurate the results will be.`}
						</p>
						<div className="mt-2">
							<textarea
								className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-600 sm:text-sm sm:leading-6"
								data-testid="context-input"
								id="Context"
								maxLength={300}
								name="Context"
								onChange={e => setContext(e.target.value)}
								placeholder="Enter your context here..."
								rows="4"
								value={context}
							></textarea>
							<p
								className={`mt-1 text-sm ${determineTextColorBasedOnLength(context, 300)}`}
								data-testid="context-counter"
							>
								Remaining {300 - context.length}/300 characters
							</p>
						</div>
					</div>
					<div className={'mb-4'}>
						<label
							className="block text-sm font-medium leading-6 text-slate-900"
							htmlFor="languageToTranslate"
						>
							Language (Optional)
						</label>
						<p className="mt-1 text-sm italic text-slate-500">
							Specify the language for the generated metadata. You can select
							from the list or enter a custom language code.
						</p>
						<div className="mt-2">
							<input
								className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-600 sm:text-sm sm:leading-6"
								id="languageToTranslate"
								maxLength={25}
								name="languageToTranslate"
								onChange={e => setLanguageToTranslate(e.target.value)}
								placeholder="Enter language code (e.g., en, fr, es)"
								type="text"
								value={languageToTranslate}
							/>
						</div>
					</div>
					<div>
						<label
							className="block text-sm font-medium leading-6 text-slate-900"
							htmlFor="jsonSchema"
						>
							JSON Schema (Optional)
						</label>
						<p className="mt-1 text-sm italic text-slate-500">
							{`Specify the desired JSON schema for the API response. This allows
							you to customize the structure and format of the returned data. Use
							valid JSON syntax to define the schema. If left empty, the API will
							return the default schema.`}
						</p>
						<div className="relative mt-2 w-full overflow-hidden rounded-md border-0 py-2.5 pl-0.5 pr-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300">
							{jsonSchema}
							<div className={'absolute right-3 top-2'}>
								<div className="flex items-center justify-end">
									{isJsonValid ? (
										<span
											className="text-sm text-green-600"
											data-testid="json-valid"
										>
											Valid JSON
										</span>
									) : (
										<span
											className="text-sm text-red-600"
											data-testid="json-invalid"
										>
											Invalid JSON
										</span>
									)}
								</div>
							</div>
						</div>
						<p
							className={`mt-1 text-sm ${determineTextColorBasedOnLength(jsonSchema, 1000)}`}
							data-testid="json-schema-counter"
						>
							Remaining {1000 - jsonSchema.length}/1000 characters
						</p>
					</div>

					<div>
						<button
							className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
								!isJsonValid || !image || userCredits === 0
									? 'cursor-not-allowed bg-slate-400'
									: 'bg-forvoyez_orange-600 hover:bg-forvoyez_orange-500 focus-visible:outline-forvoyez_orange-600'
							}`}
							data-testid="analyze-button"
							disabled={!isJsonValid || !image || userCredits === 0}
							onClick={handleSubmit}
							type="button"
						>
							Analyze your image
						</button>
					</div>
				</div>
				<div className={'flex flex-col'}>
					<h3>Request Preview</h3>
					<p className="mt-1 text-sm italic text-slate-500">
						{`This section shows a preview of the request that will be sent to the API when you click the "Analyze your image" button. It includes the HTTP method, API URL, request headers, and the request body containing the selected image, additional context, and JSON schema.`}
					</p>
					<div className="sm:hidden">
						<label className="sr-only" htmlFor="tabs">
							Select a language
						</label>
						<select
							className="block w-full rounded-md border-slate-300 focus:border-forvoyez_orange-500 focus:ring-forvoyez_orange-500"
							data-testid="language-select"
							id="tabs"
							name="tabs"
						>
							{previewLanguages.map(language => (
								<option key={language}>{language}</option>
							))}
						</select>
					</div>
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
													languageToTranslate,
													language,
													image,
													context,
													jsonSchema,
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
				<div className={'flex flex-col xl:col-span-2'} ref={apiResponseRef}>
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
		</>
	)
}
