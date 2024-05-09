'use client'
import { useEffect, useRef, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import { defaultJsonTemplateSchema } from '@/constants/playground'
import {
	describePlayground,
	describePlaygroundAction,
} from '@/app/actions/app/playground'
import { LoadAnimation } from '@/components/Playground/LoadAnimation'
import { CheckIcon, ClipboardIcon } from '@heroicons/react/20/solid'
import { loader } from '@monaco-editor/react'

export function Playground() {
	const [isPreviewCopied, setIsPreviewCopied] = useState(false)
	const [isResponseCopied, setIsResponseCopied] = useState(false)

	const [isProcessingResultApi, setIsProcessingResultApi] = useState(false)
	const [isJsonValid, setIsJsonValid] = useState(true)

	const [requestPreviewValue, setRequestPreviewValue] = useState('')
	const [image, setImage] = useState(null)
	const [imagePreview, setImagePreview] = useState(null)
	const [imageSize, setImageSize] = useState(0)

	const [context, setContext] = useState('')
	const [jsonSchema, setJsonSchema] = useState('')
	const [response, setResponse] = useState(
		'Waiting for an image to be analyzed... Please upload an image and click the Analyze your image button.'
	)

	const [isDraggingOver, setIsDraggingOver] = useState(false)
	const [uploadError, setUploadError] = useState(null)

	const editorRef = useRef(null)
	const requestPreviewRef = useRef(null)
	const responseRef = useRef(null)
	const apiResponseRef = useRef(null)

	const handleSubmit = async e => {
		e.preventDefault()

		if (!image) {
			setUploadError('Please select an image')
			return
		}

		if (imageSize > 10 * 1024 * 1024) {
			setUploadError('Image size should not exceed 10MB')
			return
		}

		const formData = new FormData()
		formData.append('image', image)
		formData.append(
			'data',
			JSON.stringify({
				context,
				schema: jsonSchema || defaultJsonTemplateSchema,
			})
		)

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
			navigator.clipboard
				.writeText(content)
				.then(() => {
					console.log('Content copied using clipboard API')
				})
				.catch(err => {
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
				console.log('Content copied using execCommand')
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
		const editor = editorRef.current
		if (editor) {
			const resizeHandler = () => resizeEditor(editor)
			const disposable = editor.onDidChangeModelContent(resizeHandler)
			resizeEditor(editor)
			return () => disposable.dispose()
		}
	}, [])

	useEffect(() => {
		const requestPreviewEditor = requestPreviewRef.current
		if (requestPreviewEditor) {
			const resizeHandler = () => resizeEditor(requestPreviewEditor)
			const disposable =
				requestPreviewEditor.onDidChangeModelContent(resizeHandler)
			resizeEditor(requestPreviewEditor)
			return () => disposable.dispose()
		}
	}, [requestPreviewValue])

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

	useEffect(() => {
		const fetchRequest = `// --- Request Headers ---
Content-Type: multipart/form-data
Authorization: Bearer <user-token>

/* (The "Bearer" token is a JSON Web Token (JWT) that includes the user's authentication information. It is used to authenticate the user and authorize access to the API.) */

// --- Request Body ---
{
	image: ${image ? image.name : 'No file selected'} 
	/* (The "image" field contains the selected image file to be sent to the API for processing.) */
	
	context: ${context || 'No context provided'} 
	/* (The "context" field includes any additional context or information about the image provided by the user. This context helps the API better understand and process the image.) */
	
	schema: ${formatJsonSchema(jsonSchema)}
	/* (The "schema" field contains the JSON schema specified by the user. 
	It defines the desired structure and format of the API response.) */
}`

		setRequestPreviewValue(fetchRequest)
	}, [image, context, jsonSchema, isJsonValid])

	return (
		<div className="grid-col-1 grid gap-8 xl:grid-cols-2">
			<div className={'flex flex-col gap-4'}>
				<div>
					<h3>Image upload</h3>
					<label
						htmlFor="image"
						className="block text-sm font-medium leading-6 text-slate-900"
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
						role={'button'}
						className={`mt-2 flex w-full cursor-auto justify-center rounded-lg border border-dashed ${
							isDraggingOver
								? 'border-forvoyez_orange-600 bg-forvoyez_orange-50'
								: 'border-slate-900/25'
						}`}
						onDrop={handleImageDrop}
						onDragOver={e => e.preventDefault()}
						onDragEnter={handleDragEnter}
						onDragLeave={handleDragLeave}
					>
						{imagePreview ? (
							<div className={'relative'}>
								<img
									src={imagePreview}
									alt="Uploaded"
									className="max-h-48 rounded-lg"
								/>
								<button
									onClick={handleResetImage}
									className="absolute -right-4 top-[1.25rem] rounded-full bg-forvoyez_orange-600 p-1 text-white shadow-md hover:bg-forvoyez_orange-500 focus:outline-none focus:ring-2 focus:ring-forvoyez_orange-500 focus:ring-offset-2"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						) : (
							<label
								htmlFor="image"
								className="flex h-full w-full cursor-pointer flex-col items-center justify-center px-6 py-10 text-center"
							>
								<div>
									<svg
										className="mx-auto h-12 w-12 text-slate-300"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
											clip-rule="evenodd"
										/>
									</svg>
									<div
										className={'m-0 flex items-center justify-center gap-1 p-0'}
									>
										<span className="text-sm font-semibold text-forvoyez_orange-600 hover:text-forvoyez_orange-500">
											Upload a file
										</span>
										<input
											id="image"
											name="image"
											type="file"
											className="sr-only"
											onChange={handleImageChange}
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
						{uploadError && (
							<p className="text-sm text-red-600">{uploadError}</p>
						)}
					</div>
				</div>
				<div>
					<label
						htmlFor="comment"
						className="block text-sm font-medium leading-6 text-slate-900"
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
							rows="4"
							name="Context"
							id="Context"
							placeholder="Enter your context here..."
							value={context}
							onChange={e => setContext(e.target.value)}
							className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-600 sm:text-sm sm:leading-6"
						></textarea>
					</div>
				</div>
				<div>
					<label
						htmlFor="jsonSchema"
						className="block text-sm font-medium leading-6 text-slate-900"
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
						<MonacoEditor
							language="json"
							theme="vs-light"
							editorDidMount={editor => (editorRef.current = editor)}
							value={jsonSchema}
							onMount={editor => {
								editorRef.current = editor
								resizeEditor(editor)
							}}
							onChange={value => setJsonSchema(value)}
							width={'100%'}
							height={'500px'}
							options={{
								colorDecorators: true,
								lineNumbers: 'on',
								minimap: { enabled: false },
								scrollBeyondLastLine: false,
								wordWrap: 'on',
								fontSize: 14,
								fontFamily: 'var(--font-jost)',
								tabSize: 4,
								autoIndent: true,
								formatOnPaste: true,
								formatOnType: true,
								folding: true,
								readOnly: false,
								quickSuggestions: true,
								// Add these options for syntax highlighting
								selectOnLineNumbers: true,
								renderLineHighlight: 'all',
								contextmenu: true,
								matchBrackets: 'always',
								autoClosingBrackets: 'always',
								automaticLayout: true,
							}}
						/>
					</div>
				</div>
				<div className="flex items-center justify-end">
					{isJsonValid ? (
						<span className="text-sm text-green-600">Valid JSON</span>
					) : (
						<span className="text-sm text-red-600">Invalid JSON</span>
					)}
				</div>
				<div>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={!isJsonValid || !image}
						className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
							!isJsonValid || !image
								? 'cursor-not-allowed bg-slate-400'
								: 'bg-forvoyez_orange-600 hover:bg-forvoyez_orange-500 focus-visible:outline-forvoyez_orange-600'
						}`}
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
				<div className="relative mt-2 w-full overflow-hidden rounded-md border-0 py-2.5 pl-0.5 pr-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300">
					<MonacoEditor
						language="javascript"
						theme="vs-light"
						value={requestPreviewValue}
						editorDidMount={editor => (requestPreviewRef.current = editor)}
						width={'100%'}
						options={{
							minimap: { enabled: false },
							scrollBeyondLastLine: false,
							wordWrap: 'on',
							fontSize: 14,
							fontFamily: 'var(--font-jost)',
							tabSize: 4,
							autoIndent: true,
							formatOnPaste: true,
							formatOnType: true,
							folding: true,
							readOnly: false,
							quickSuggestions: true,
							// Add these options for syntax highlighting
							selectOnLineNumbers: true,
							renderLineHighlight: 'all',
							contextmenu: true,
							matchBrackets: 'always',
							autoClosingBrackets: 'always',
							automaticLayout: true,
						}}
					/>
					<button
						className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-forvoyez_orange-500"
						onClick={() => {
							copyToClipboard(requestPreviewValue)
							setIsPreviewCopied(true)
							setTimeout(() => setIsPreviewCopied(false), 2000)
						}}
					>
						{isPreviewCopied ? (
							<CheckIcon className="h-5 w-5 text-green-500" />
						) : (
							<ClipboardIcon className="h-5 w-5" />
						)}
					</button>
				</div>
			</div>
			<div ref={apiResponseRef} className={'flex flex-col xl:col-span-2'}>
				<h3>API Response</h3>
				<p className="mt-1 text-sm italic text-slate-500">
					{`This section displays the response received from the API after submitting the request. It will show the generated title, alternative text, and caption for the analyzed image based on the provided image, context, and JSON schema.`}
				</p>

				{isProcessingResultApi ? (
					<LoadAnimation />
				) : (
					<div className="relative mt-2 w-full overflow-hidden rounded-md border-0 py-2.5 pl-0.5 pr-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300">
						<MonacoEditor
							language="json"
							theme="vs-light"
							editorDidMount={editor => (responseRef.current = editor)}
							value={JSON.stringify(response, null, 4)}
							onMount={editor => {
								responseRef.current = editor
								resizeEditor(editor)
							}}
							width={'100%'}
							height={'500px'}
							options={{
								colorDecorators: true,
								lineNumbers: 'on',
								minimap: { enabled: false },
								scrollBeyondLastLine: false,
								wordWrap: 'on',
								fontSize: 14,
								fontFamily: 'var(--font-jost)',
								tabSize: 4,
								autoIndent: true,
								formatOnPaste: true,
								formatOnType: true,
								folding: true,
								readOnly: true,
								quickSuggestions: true,
								// Add these options for syntax highlighting
								selectOnLineNumbers: true,
								renderLineHighlight: 'all',
								contextmenu: true,
								matchBrackets: 'always',
								autoClosingBrackets: 'always',
								automaticLayout: true,
							}}
						/>
						<button
							className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-forvoyez_orange-500"
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
	)
}
