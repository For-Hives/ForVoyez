import {
	blobToBase64,
	getImageDescription,
} from '@/services/imageDescription.service'
import { decrementCredit } from '@/services/database.service'
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
function isValidSchema() {
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
				statusText: 'Unauthorized, missing Authorization header',
				status: 401,
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

			if (!user || user.credits <= 0) {
				console.error('Unauthorized, no credit left, user : ', payload.userId)
				return new Response('Unauthorized, no credit left', {
					statusText: 'Unauthorized, no credit left',
					status: 401,
				})
			}
		} catch (error) {
			console.error(
				'Unauthorized, invalid token : ',
				error,
				' user : ',
				payload.userId
			)
			return new Response('Unauthorized, invalid token', {
				statusText: 'Unauthorized, invalid token',
				status: 401,
			})
		}

		const formData = await request.formData()

		const file = formData.get('image')
		if (!file) {
			return new Response('Bad Request, No file uploaded', {
				statusText: 'Bad Request, No file uploaded',
				status: 400,
			})
		}

		// Check if the uploaded file is an image
		if (!isValidImageFile(file)) {
			return new Response('Bad Request, Invalid image file', {
				statusText: 'Bad Request, Invalid image file',
				status: 400,
			})
		}

		const schema = formData.get('schema') || {}
		const context = formData.get('context') || ''
		const keywords = formData.get('keywords') || ''
		const language = formData.get('language') || 'en' // Default language is English

		// Validate the schema if provided
		if (schema && !isValidSchema(schema)) {
			return new Response('Invalid schema', {
				statusText: 'Bad Request',
				status: 400,
			})
		}

		const base64Image = await blobToBase64(file)

		const descriptionResult = await getImageDescription(base64Image, {
			language,
			keywords,
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
			headers: { 'Content-Type': 'application/json' },
			status: 200,
		})
	} catch (error) {
		console.error('Error processing the request:', error)
		return new Response('Internal Server Error', {
			statusText: 'Internal Server Error',
			status: 500,
		})
	}
}
