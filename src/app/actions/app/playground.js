'use server'

import { currentUser } from '@clerk/nextjs/server'
import {
	blobToBase64,
	getImageDescription,
} from '@/services/imageDescription.service'
import { prisma } from '@/services/prisma.service'

export async function describePlaygroundAction(formData) {
	console.log('describePlaygroundAction')
	console.log(formData)
	const user = await currentUser()

	if (!user) {
		console.log('User not authenticated')
		throw new Error('Unauthorized')
	}

	const userData = await prisma.user.findUnique({
		where: {
			clerkId: user.id,
		},
	})

	if (userData.credits <= 0) {
		console.log('No credits left')
		throw new Error('No credits left')
	}

	if (!image) {
		console.log('No file uploaded')
		throw new Error('No file uploaded')
	}

	// todo : check if file is an image
	if (!jsonSchema) {
		console.log('No schema provided')
		throw new Error('No schema provided')
	}
	const schema = JSON.parse(jsonSchema)
	// todo : validate schema

	const base64Image = await blobToBase64(image)

	let descriptionResult = ''
	if (process.env.NODE_ENV === 'development') {
		descriptionResult = {
			name: 'Cherry Blossom Kittens',
			alternativeText:
				'Two playful animated kittens surrounded by cherry blossoms',
			caption: 'Adorable kittens frolicking among beautiful cherry blossoms',
		}
		return descriptionResult
	} else {
		const reader = await getImageDescription(base64Image, schema)

		// Process the streaming response
		let result = ''
		for await (const chunk of reader) {
			const lines = chunk
				.toString()
				.split('\n')
				.filter(line => line.trim() !== '')
			for (const line of lines) {
				const message = line.replace(/^data: /, '')
				if (message === '[DONE]') {
					return JSON.parse(result)
				}
				result += message
			}
		}
	}
}
