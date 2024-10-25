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

	const [formData, setFormData] = useState({
		jsonSchema: JSON.stringify(defaultJsonTemplateSchema, null, 4),
		languageToTranslate: '',
		keywords: '',
		image: null,
		context: '',
	})

	const [isProcessingResultApi, setIsProcessingResultApi] = useState(false)
	const [response, setResponse] = useState(null)

	const apiResponseRef = useRef(null)

	async function handleSubmit(e) {
		e.preventDefault()

		if (!formData.image) {
			setUploadError('Please select an image')
			return
		}

		// 10 * 1024 * 1024
		if (formData.image.size > 10485760) {
			setUploadError('Image size should not exceed 10MB')
			return
		}

		const formDataObject = new FormData()
		formDataObject.append('image', formData.image)
		const dataObject = {
			schema: formData.jsonSchema || defaultJsonTemplateSchema,
			language: formData.languageToTranslate,
			context: formData.context,
		}

		formDataObject.append('data', JSON.stringify(dataObject))

		setIsProcessingResultApi(true)
		apiResponseRef.current?.scrollIntoView({ behavior: 'smooth' })

		try {
			const response = await describePlaygroundAction(formDataObject)
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
		getCreditsFromUserId().then(credits => {
			setUserCredits(credits)
			setShowTooltip(credits === 0)
		})
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
				<PlaygroundForm
					formData={formData}
					handleSubmit={handleSubmit}
					setFormData={setFormData}
					userCredits={userCredits}
				/>

				{/* ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */}

				<div className="flex flex-col">
					<div className={'flex flex-col'} ref={apiResponseRef}>
						<h3>API Response</h3>
						<p className="mt-1 text-sm italic text-slate-500">
							{`This section displays the response received from the API after submitting the request. It will show the generated title, alternative text, and caption for the analyzed image based on the provided image, context, and JSON schema.`}
						</p>
						<PlaygroundResponse
							processingResultApi={isProcessingResultApi}
							response={response}
						/>

						<p className={'text-md my-4 hidden text-slate-500 sm:block'}>
							remaining credits: &nbsp;
							<span className={'font-semibold text-slate-900'}>
								{userCredits}
							</span>
						</p>
					</div>

					<PlaygroundPreviewCode formData={formData} />
				</div>
			</div>
		</>
	)
}
