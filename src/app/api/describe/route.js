import { decrementCredit } from '@/services/database.service'
import {
	blobToBase64,
	getImageDescription,
} from '@/services/imageDescription.service'
import { verifyJwt } from '@/services/jwt.service'
import { prisma } from '@/services/prisma.service'

// Helper function to check if a file is a valid image
function isValidImageFile(file) {
	const validTypes = [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/webp',
		'image/gif',
	]
	return validTypes.includes(file.type)
}

// Helper function to validate the schema
function isValidSchema(schema) {
	// Implement your schema validation logic here
	// Return true if the schema is valid, false otherwise
	return true
}

export async function POST(request) {
	// Process multipart/form-data containing an image and a JSON schema.
	let user
	let payload
	try {
		// get the authorisation header
		const authorization = request.headers.get('Authorization')
		if (!authorization) {
			return new Response('Unauthorized', {
				status: 401,
				statusText: 'Unauthorized, missing Authorization header',
			})
		}

		// check if the token is valid
		try {
			payload = await verifyJwt(authorization)

			// check if the token is still valid and if the user is have credit left
			user = await prisma.user.findUnique({
				where: {
					clerkId: payload.userId,
				},
			})

			if (user.credits <= 0) {
				return new Response('Unauthorized, no credit left', {
					status: 401,
					statusText: 'Unauthorized',
				})
			}
		} catch (error) {
			return new Response('Unauthorized, invalid token', {
				status: 401,
				statusText: 'Unauthorized',
			})
		}

		const formData = await request.formData()

		const file = formData.get('image')
		if (!file) {
			return new Response('No file uploaded', {
				status: 400,
				statusText: 'Bad Request',
			})
		}

		// Check if the uploaded file is an image
		if (!isValidImageFile(file)) {
			return new Response('Invalid image file', {
				status: 400,
				statusText: 'Bad Request',
			})
		}

		const data = JSON.parse(formData.get('data') || '{}')
		const schema = data.schema || {}
		const context = data.context || ''

		// Validate the schema if provided
		if (schema && !isValidSchema(schema)) {
			return new Response('Invalid schema', {
				status: 400,
				statusText: 'Bad Request',
			})
		}

		const base64Image = await blobToBase64(file)

		const descriptionResult = await getImageDescription(base64Image, {
			context,
			schema,
		})

		console.info(`User ${payload.userId} used 1 credit`)

		// update the user credit
		decrementCredit(
			'decrement token from Describe Action',
			authorization.replace('Bearer ', '')
		)

		return new Response(JSON.stringify(descriptionResult), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		})
	} catch (error) {
		console.error('Error processing the request:', error)
		return new Response('Internal Server Error', { status: 500 })
	}
}
