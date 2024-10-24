'use client'
import { useEffect, useRef, useState } from 'react'

import { describePlaygroundAction } from '@/app/actions/app/playground'
import Link from 'next/link'

import PlaygroundPreviewCode from '@/components/Playground/PlaygroundPreviewCode.component'
import PlaygroundResponse from '@/components/Playground/PlaygroundResponse.component'
import PlaygroundForm from '@/components/Playground/PlaygroundForm.component'
import { defaultJsonTemplateSchema } from '@/constants/playground'
import { getCreditsFromUserId } from '@/services/database.service'

export function Playground() {
	const [userCredits, setUserCredits] = useState(0)
	const [showTooltip, setShowTooltip] = useState(false)

	const [imageSize, setImageSize] = useState(0)

	const [isProcessingResultApi, setIsProcessingResultApi] = useState(false)
	const [languageToTranslate, setLanguageToTranslate] = useState('')
	const [image, setImage] = useState(null)

	const [context, setContext] = useState('')

	const [jsonSchema, setJsonSchema] = useState('')
	const [response, setResponse] = useState(null)

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
					setImageSize={setImageSize}
					setJsonSchema={setJsonSchema}
					setLanguageToTranslate={setLanguageToTranslate}
					userCredits={userCredits}
				/>

				{/* ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */}

				<div className="flex hidden flex-col sm:block">
					<div className={'flex hidden flex-col sm:block'} ref={apiResponseRef}>
						<h3>API Response</h3>
						<p className="mt-1 text-sm italic text-slate-500">
							{`This section displays the response received from the API after submitting the request. It will show the generated title, alternative text, and caption for the analyzed image based on the provided image, context, and JSON schema.`}
						</p>
						<PlaygroundResponse
							processingResultApi={isProcessingResultApi}
							response={response}
						/>

						<p className={'text-md my-4 text-slate-500'}>
							remaining credits: &nbsp;
							<span className={'font-semibold text-slate-900'}>
								{userCredits}
							</span>
						</p>
					</div>

					<PlaygroundPreviewCode
						context={context}
						image={image}
						jsonSchema={jsonSchema}
						languageToTranslate={languageToTranslate}
					/>
				</div>
			</div>
		</>
	)
}
