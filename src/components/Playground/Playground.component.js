'use client'
import { useState } from 'react'

export function Playground() {
	const [image, setImage] = useState(null)
	const [imagePreview, setImagePreview] = useState(null)
	const [imageSize, setImageSize] = useState(0)
	const [uploadProgress, setUploadProgress] = useState(0)

	const [context, setContext] = useState('')
	const [jsonSchema, setJsonSchema] = useState('')
	const [response, setResponse] = useState(null)

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

	return (
		<div className="grid grid-cols-3 gap-8">
			<div className={'flex flex-col gap-4'}>
				<div>
					<h3>Image upload</h3>
					<label
						htmlFor="image"
						className="sr-only block text-sm font-medium leading-6 text-gray-900"
					>
						Your image
					</label>
					<button
						className="mt-2 flex w-full justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
						onDrop={handleImageDrop}
						onClick={e => e.preventDefault()}
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
					</button>
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
				<textarea
					placeholder="Context"
					value={context}
					onChange={e => setContext(e.target.value)}
				/>
				<textarea
					placeholder="JSON Schema"
					value={jsonSchema}
					onChange={e => setJsonSchema(e.target.value)}
				/>
				<button
					type="button"
					onClick={handleSubmit}
					className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				>
					Submit
				</button>
			</div>
			<div>
				<h3>Request Preview</h3>
				<pre>{JSON.stringify({ image, context, jsonSchema }, null, 2)}</pre>
			</div>
			<div>
				<h3>API Response</h3>
				<pre>{JSON.stringify(response, null, 2)}</pre>
			</div>
		</div>
	)
}
