'use server'

import { currentUser } from '@clerk/nextjs/server'
import {
	blobToBase64,
	getImageDescription,
} from '@/services/imageDescription.service'
import { prisma } from '@/services/prisma.service'

export async function describePlaygroundAction(formData) {
	const user = await currentUser()

	if (!user) {
		console.log('User not authenticated')
		throw new Error('Unauthorized')
	}

	console.log('Fetching User Data...')
	const userData = await prisma.user.findUnique({
		where: {
			clerkId: user.id,
		},
	})
	console.log('User Data:', userData)

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

	if (!jsonSchema) {
		console.log('No schema provided')
		throw new Error('No schema provided')
	}

	const schema = JSON.parse(jsonSchema)

	const base64Image = await blobToBase64(image)

	// Get image description using base64 encoded image
	const description = await getImageDescription(base64Image, schema)

	// Return the description as a directly usable JSON object
	return {
		status: 200,
		data: description,
	}
}
