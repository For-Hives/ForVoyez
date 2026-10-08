'use server'

import { currentUser } from '@clerk/nextjs/server'

import {
	InvalidDescribeInputError,
	normalizeDescribeSchema,
} from '@/helpers/describeInput'
import {
	blobToBase64,
	getImageDescription,
} from '@/services/imageDescription.service'
import { chargeOneCredit } from '@/services/database.service'
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

	// no DB row yet (createUser not run) means no credit either
	if (!userData || userData.credits <= 0) {
		console.error('No credits left')
		throw new Error('No credits left')
	}

	const file = formData.get('image')
	if (!file) {
		console.error('No file uploaded')
		throw new Error('No file uploaded')
	}

	const data = JSON.parse(formData.get('data') || '{}')
	const context = data.context || ''
	const keywords = data.keywords || ''
	const language = data.language || 'en' // Default language is English

	// same limits as the API: a schema with too many or too long fields is
	// refused before any credit is charged
	let schema
	try {
		schema = normalizeDescribeSchema(data.schema)
	} catch (error) {
		if (error instanceof InvalidDescribeInputError) {
			return { error: error.message, status: 400 }
		}
		throw error
	}

	const base64Image = await blobToBase64(file)

	// Get image description using base64 encoded image. One credit is reserved
	// atomically before the generation and refunded if it fails.
	let description
	try {
		description = await chargeOneCredit(
			user.id,
			{ reason: 'describe from PlaygroundAction' },
			() =>
				getImageDescription(base64Image, {
					keywords,
					language,
					context,
					schema,
				})
		)
	} catch (error) {
		// e.g. a schema that needs a longer answer than the output cap (the
		// credit was refunded)
		if (error instanceof InvalidDescribeInputError) {
			return { error: error.message, status: 400 }
		}
		throw error
	}

	// Return the description as a directly usable JSON object
	return {
		data: description,
		status: 200,
	}
}
