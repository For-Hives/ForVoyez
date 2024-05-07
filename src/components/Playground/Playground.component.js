'use client'
import { useEffect, useRef, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import { defaultJsonTemplateSchema } from '@/constants/playground'

export function Playground() {
	const [isJsonValid, setIsJsonValid] = useState(true)

	const [image, setImage] = useState(null)
	const [imagePreview, setImagePreview] = useState(null)
	const [imageSize, setImageSize] = useState(0)
	const [uploadProgress, setUploadProgress] = useState(0)

	const [context, setContext] = useState('')
	const [jsonSchema, setJsonSchema] = useState('')
	const [response, setResponse] = useState(null)

	const editorRef = useRef(null)

	const handleImageChange = e => {
		const file = e.target.files[0]
		setImage(file)
		setImagePreview(URL.createObjectURL(file))
		setImageSize(file.size)
	}

	const handleImageDrop = e => {
		e.preventDefault()
		const file = e.dataTransfer.files[0]
		setImage(file)
		setImagePreview(URL.createObjectURL(file))
		setImageSize(file.size)
	}

	const handleSubmit = async e => {
		e.preventDefault()

		const formData = new FormData()
		formData.append('image', image)
		formData.append('context', context)
		formData.append('jsonSchema', jsonSchema)

		const res = await fetch('/api/process', {
			method: 'POST',
			body: formData,
			onUploadProgress: progressEvent => {
				const progress = (progressEvent.loaded / progressEvent.total) * 100
				setUploadProgress(progress)
			},
		})

		const data = await res.json()
		setResponse(data)
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

	const formatJson = () => {
		if (editorRef.current) {
			const editor = editorRef.current
			const formattedJson = JSON.stringify(
				JSON.parse(editor.getValue()),
				null,
				4
			)
			editor.setValue(formattedJson)
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

	return (
		<div className="grid-col-1 grid gap-8 xl:grid-cols-3">
			<div className={'flex flex-col gap-4'}>
				<div>
					<h3>Image upload</h3>
					<label
						htmlFor="image"
						className="block text-sm font-medium leading-6 text-gray-900"
					>
						Your image
					</label>
					<p className="mt-1 text-sm italic text-gray-500">
						{`Upload an image to process with our API. The image should be in PNG,
							JPG, or GIF format and not exceed 10MB in size. You can either click
							the "Upload a file" button or drag and drop an image into the
							designated area.`}
					</p>
					<div
						role={'button'}
						className="mt-2 flex w-full justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
						onDrop={handleImageDrop}
						onDragOver={e => e.preventDefault()}
					>
						{imagePreview ? (
							<img src={imagePreview} alt="Uploaded" className="max-h-48" />
						) : (
							<div className="flex flex-col text-center">
								<svg
									className="mx-auto h-12 w-12 text-gray-300"
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
								<div className="flex items-center text-sm leading-6 text-gray-600">
									<label
										htmlFor="image"
										className="relative m-0 cursor-pointer rounded-md bg-white p-0 font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
									>
										<span>Upload a file</span>
										<input
											id="image"
											name="image"
											type="file"
											className="sr-only"
											onChange={handleImageChange}
										/>
									</label>
									<p className="pl-1">or drag and drop</p>
								</div>
								<p className="m-0 p-0 text-xs italic text-gray-600">
									(Only PNG, JPG, GIF up to 10MB)
								</p>
							</div>
						)}
					</div>
					{image && (
						<div className="mt-2">
							<p className="text-sm text-gray-500">
								{image.name} ({(imageSize / 1024 / 1024).toFixed(2)} MB)
							</p>
							<progress
								className="w-full"
								value={uploadProgress}
								max="100"
							></progress>
						</div>
					)}
				</div>
				<div>
					<label
						htmlFor="comment"
						className="block text-sm font-medium leading-6 text-gray-900"
					>
						Add Your Context
					</label>
					<p className="mt-1 text-sm italic text-gray-500">
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
							className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
						></textarea>
					</div>
				</div>
				<div>
					<label
						htmlFor="jsonSchema"
						className="block text-sm font-medium leading-6 text-gray-900"
					>
						JSON Schema
					</label>
					<p className="mt-1 text-sm italic text-gray-500">
						{`Specify the desired JSON schema for the API response. This allows
							you to customize the structure and format of the returned data. Use
							valid JSON syntax to define the schema. If left empty, the API will
							return the default schema.`}
					</p>
					<div className="relative mt-2 w-full overflow-hidden">
						<MonacoEditor
							language="json"
							theme="vs-light"
							editorDidMount={editor => (editorRef.current = editor)}
							value={jsonSchema}
							onMount={editor => {
								editorRef.current = editor
								formatJson()
							}}
							onChange={value => setJsonSchema(value)}
							width={'100%'}
							height={'500px'}
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
								lineNumbers: 'on',
								readOnly: false,
								quickSuggestions: true,
							}}
						/>
					</div>
				</div>
				<div className="mt-4 flex items-center justify-between">
					<button
						type="button"
						onClick={() => {
							const editor = editorRef.current
							const formattedJson = editor.getValue()
							setJsonSchema(formattedJson)
						}}
						className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Format JSON
					</button>
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
						className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Submit
					</button>
				</div>
			</div>
			<div>
				<h3>Request Preview</h3>
				<MonacoEditor
					language="json"
					theme="vs-light"
					value={JSON.stringify({ image, context, jsonSchema }, null, 2)}
					options={{
						readOnly: true,
						minimap: { enabled: false },
						scrollBeyondLastLine: false,
						wordWrap: 'on',
						fontSize: 14,
						fontFamily: 'var(--font-jost)',
						tabSize: 4,
						folding: true,
						lineNumbers: 'on',
						quickSuggestions: false,
					}}
				/>
			</div>
			<div>
				<h3>API Response</h3>
				<MonacoEditor
					language="json"
					theme="vs-light"
					value={JSON.stringify(response, null, 2)}
					options={{
						readOnly: true,
						minimap: { enabled: false },
						scrollBeyondLastLine: false,
						wordWrap: 'on',
						fontSize: 14,
						fontFamily: 'var(--font-jost)',
						tabSize: 4,
						folding: true,
						lineNumbers: 'on',
						quickSuggestions: false,
					}}
				/>
			</div>
		</div>
	)
}
