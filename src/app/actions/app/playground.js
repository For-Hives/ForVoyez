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

	const image = formData.get('image')
	const context = formData.get('context')
	const jsonSchema = formData.get('jsonSchema')

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

	const reader = await getImageDescription(base64Image, schema)

	// Set up the response headers for streaming
	const headers = new Headers({
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive',
	})
	const stream = new ReadableStream({
		async start(controller) {
			const decoder = new TextDecoder('utf-8')
			let result = ''

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				const chunk = decoder.decode(value)
				const lines = chunk.split('\n').filter(line => line.trim() !== '')
				for (const line of lines) {
					const message = line.replace(/^data: /, '')
					if (message === '[DONE]') {
						controller.enqueue(`data: ${JSON.stringify(result)}\n\n`)
						controller.close()
						return
					}
					result += message
					controller.enqueue(`data: ${JSON.stringify(result)}\n\n`)
				}
			}
		},
	})

	return new Response(stream, { headers })
}
