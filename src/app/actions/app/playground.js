'use server'

import { currentUser } from '@clerk/nextjs/server'

import { decrementCreditForUserFromPlayground } from '@/services/database.service'
import {
	blobToBase64,
	getImageDescription,
} from '@/services/imageDescription.service'
import { prisma } from '@/services/prisma.service'

export async function describePlaygroundAction(formData) {
	const user = await currentUser()

	if (!user) {
		console.error('User not authenticated')
		throw new Error('Unauthorized')
	}

	const userData = await prisma.user.findUnique({
		where: {
			clerkId: user.id,
		},
	})

	if (userData.credits <= 0) {
		console.error('No credits left')
		throw new Error('No credits left')
	}

	const file = formData.get('image')
	if (!file) {
		console.error('No file uploaded')
		throw new Error('No file uploaded')
	}

	const data = JSON.parse(formData.get('data') || '{}')
	const schema = data.schema || {}
	const context = data.context || ''

	const base64Image = await blobToBase64(file)

	// Get image description using base64 encoded image
	const description = await getImageDescription(base64Image, {
		context,
		schema,
	})

	// Update the user credit using the updateCreditForUser function
	await decrementCreditForUserFromPlayground()

	// Return the description as a directly usable JSON object
	return {
		status: 200,
		data: description,
	}
}
