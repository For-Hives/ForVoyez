import {
	blobToBase64,
	getImageDescription,
} from '@/services/imageDescription.service'
import { verifyJwt } from '@/services/jwt.service'
import { prisma } from '@/services/prisma.service'

export async function POST(request) {
	// Process multipart/form-data containing an image and a JSON schema.
	try {
		// get the authorisation header
		const authorization = request.headers.get('Authorization')
		if (!authorization) {
			console.log('No Authorization header')
			return new Response('Unauthorized', {
				status: 401,
				statusText: 'Unauthorized, missing Authorization header',
			})
		}

		// check if the token is valid
		try {
			let payload = await verifyJwt(authorization)
			console.log(payload)

			// check if the token is still valid and if the user is have credit left
			let user = await prisma.user.findUnique({
				where: {
					clerkId: payload.userId,
				},
			})

			console.log(user)
			if (user.credits <= 0) {
				console.log('No credit left')
				return new Response('Unauthorized, no credit left', {
					status: 401,
					statusText: 'Unauthorized',
				})
			}
		} catch (error) {
			console.log('Invalid token')
			return new Response('Unauthorized, invalid token', {
				status: 401,
				statusText: 'Unauthorized',
			})
		}

		const formData = await request.formData()

		const file = formData.get('image')
		if (!file) {
			console.log('No file uploaded')
			return new Response('No file uploaded', {
				status: 400,
				statusText: 'Bad Request',
			})
		}

		// todo : check if file is an image
		const schemaJSON = formData.get('schema')
		if (!schemaJSON) {
			console.log('No schema provided')
			return new Response('No schema provided', {
				status: 400,
				statusText: 'Bad Request',
			})
		}
		const schema = JSON.parse(schemaJSON)
		// todo : validate schema

		const base64Image = await blobToBase64(file)

		let descriptionResult = ''
		if (process.env.NODE_ENV === 'development') {
			descriptionResult = {
				name: 'Cherry Blossom Kittens',
				alternativeText:
					'Two playful animated kittens surrounded by cherry blossoms',
				caption: 'Adorable kittens frolicking among beautiful cherry blossoms',
			}
			return new Response(JSON.stringify(descriptionResult), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		} else {
			const reader = await getImageDescription(base64Image, schema)

			// Set up the response headers for streaming
			const headers = new Headers({
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			})
			const stream = new ReadableStream({
				async start(controller) {
					for await (const chunk of reader) {
						const lines = chunk
							.toString()
							.split('\n')
							.filter(line => line.trim() !== '')
						for (const line of lines) {
							const message = line.replace(/^data: /, '')
							if (message === '[DONE]') {
								controller.close()
								return
							}
							controller.enqueue(`data: ${message}\n\n`)
						}
					}
				},
			})

			return new Response(stream, { headers })
		}
	} catch (error) {
		console.error('Error processing the request:', error)
		return new Response('Internal Server Error', { status: 500 })
	}
}
