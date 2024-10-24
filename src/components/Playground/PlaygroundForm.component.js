import { useEffect, useState } from 'react'

import { Disclosure } from '@headlessui/react'
import { motion } from 'framer-motion'

export default function PlaygroundForm(props) {
	const [isDraggingOver, setIsDraggingOver] = useState(false)

	const [imagePreview, setImagePreview] = useState(null)

	const [uploadError, setUploadError] = useState(null)
	const [isJsonValid, setIsJsonValid] = useState(true)

	useEffect(() => {
		setIsJsonValid(validateJson(props.jsonSchema))
	}, [props.jsonSchema])

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

	const handleImageDrop = e => {
		e.preventDefault()
		setIsDraggingOver(false)
		const file = e.dataTransfer.files[0]
		if (file && isValidFileType(file)) {
			props.setImage(file)
			setImagePreview(URL.createObjectURL(file))
			props.setImageSize(file.size)
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

	const isValidFileType = file => {
		const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
		return validTypes.includes(file.type)
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

	const handleImageChange = e => {
		const file = e.target.files[0]
		if (file && isValidFileType(file)) {
			props.setImage(file)
			setImagePreview(URL.createObjectURL(file))
			props.setImageSize(file.size)
			setUploadError(null)
		} else {
			setUploadError('Please select a valid image file (PNG, Webp, JPG, GIF)')
		}
	}

	const handleResetImage = () => {
		props.setImage(null)
		setImagePreview(null)
		props.setImageSize(0)
		setUploadError(null)
	}

	return (
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
					className={`mt-2 flex w-full cursor-auto justify-center rounded-lg border border-dashed ${isDraggingOver ? 'border-forvoyez_orange-600 bg-forvoyez_orange-50' : 'border-slate-900/25'}`}
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
									className={'m-0 flex items-center justify-center gap-1 p-0'}
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
				{uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
			</div>

			<Disclosure as="div" className="" key="contextfield">
				{({ open }) => (
					<>
						<dt>
							<Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
								<label
									className="block text-sm font-medium leading-6 text-slate-900"
									htmlFor="comment"
								>
									Add Your Context (Optional)
								</label>
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
						<Disclosure.Panel as="dd" className="mt-2 pr-12">
							<motion.p
								animate={{ opacity: 1, y: 0 }}
								className="text-base leading-7 text-gray-600"
								exit={{ opacity: 0, y: -10 }}
								initial={{ opacity: 0, y: -10 }}
							>
								<div>
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
											onChange={e => props.setContext(e.target.value)}
											placeholder="Enter your context here..."
											rows="4"
											value={props.context}
										></textarea>
										<p
											className={`mt-1 text-sm ${determineTextColorBasedOnLength(props.context, 300)}`}
											data-testid="context-counter"
										>
											Remaining {300 - props.context.length}/300 characters
										</p>
									</div>
								</div>
							</motion.p>
						</Disclosure.Panel>
					</>
				)}
			</Disclosure>

			<Disclosure as="div" className="" key="languagefield">
				{({ open }) => (
					<>
						<dt>
							<Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
								<label
									className="block text-sm font-medium leading-6 text-slate-900"
									htmlFor="languageToTranslate"
								>
									Language (Optional)
								</label>
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
						<Disclosure.Panel as="dd" className="mt-2 pr-12">
							<motion.p
								animate={{ opacity: 1, y: 0 }}
								className="text-base leading-7 text-gray-600"
								exit={{ opacity: 0, y: -10 }}
								initial={{ opacity: 0, y: -10 }}
							>
								<div className={'mb-4'}>
									<p className="mt-1 text-sm italic text-slate-500">
										Specify the language for the generated metadata. You can
										select from the list or enter a custom language code.
									</p>
									<div className="mt-2">
										<input
											className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-forvoyez_orange-600 sm:text-sm sm:leading-6"
											id="languageToTranslate"
											maxLength={25}
											name="languageToTranslate"
											onChange={e =>
												props.setLanguageToTranslate(e.target.value)
											}
											placeholder="Enter language code (e.g., en, fr, es)"
											type="text"
											value={props.languageToTranslate}
										/>
									</div>
								</div>
							</motion.p>
						</Disclosure.Panel>
					</>
				)}
			</Disclosure>

			<Disclosure as="div" className="" key="schemafield">
				{({ open }) => (
					<>
						<dt>
							<Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
								<label
									className="block text-sm font-medium leading-6 text-slate-900"
									htmlFor="jsonSchema"
								>
									JSON Schema (Optional)
								</label>
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
						<Disclosure.Panel as="dd" className="mt-2 pr-12">
							<motion.p
								animate={{ opacity: 1, y: 0 }}
								className="text-base leading-7 text-gray-600"
								exit={{ opacity: 0, y: -10 }}
								initial={{ opacity: 0, y: -10 }}
							>
								<div>
									<p className="mt-1 text-sm italic text-slate-500">
										{`Specify the desired JSON schema for the API response. This allows
							you to customize the structure and format of the returned data. Use
							valid JSON syntax to define the schema. If left empty, the API will
							return the default schema.`}
									</p>
									<div className="relative mt-2 w-full overflow-hidden rounded-md border-0 py-2.5 pl-0.5 pr-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300">
										{props.jsonSchema}
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
										className={`mt-1 text-sm ${determineTextColorBasedOnLength(props.jsonSchema, 1000)}`}
										data-testid="json-schema-counter"
									>
										Remaining {1000 - props.jsonSchema.length}/1000 characters
									</p>
								</div>
							</motion.p>
						</Disclosure.Panel>
					</>
				)}
			</Disclosure>

			<div>
				<button
					className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${!isJsonValid || !props.image || props.userCredits === 0 ? 'cursor-not-allowed bg-slate-400' : 'bg-forvoyez_orange-600 hover:bg-forvoyez_orange-500 focus-visible:outline-forvoyez_orange-600'}`}
					data-testid="analyze-button"
					disabled={!isJsonValid || !props.image || props.userCredits === 0}
					onClick={props.handleSubmit}
					type="button"
				>
					Analyze your image
				</button>
			</div>
		</div>
	)
}
