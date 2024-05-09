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
		// todo : check if file is an image

		const schemaJSON = formData.get('schema')
		if (!schemaJSON) {
			return new Response('No schema provided', {
				status: 400,
				statusText: 'Bad Request',
			})
		}
		const schema = JSON.parse(schemaJSON)
		// todo : validate schema

		const base64Image = await blobToBase64(file)

		// check if its local dev
		if (process.env.NODE_ENV === 'development') {
			return new Response(JSON.stringify({ base64Image }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		const descriptionResult = await getImageDescription(base64Image, schema)

		return new Response(JSON.stringify(descriptionResult), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		})
	} catch (error) {
		console.error('Error processing the request:', error)
		return new Response('Internal Server Error', { status: 500 })
	}
}
