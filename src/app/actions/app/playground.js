'use server'

import { auth } from '@clerk/nextjs/server'

import { InvalidDescribeInputError, normalizeDescribeSchema } from '@/helpers/describeInput'
import { chargeOneCredit, TooManyTooLongDescriptionsError } from '@/services/database.service'
import { acquireDescribeSlot, TOO_MANY_AT_ONCE } from '@/services/describeLimits.service'
import {
	blobToBase64,
	getImageDescription,
	ImageDimensionsTooLargeError,
	ImageTooLargeError,
	UnsupportedImageError,
} from '@/services/imageDescription.service'
import { prisma } from '@/services/prisma.service'

export async function describePlaygroundAction(formData) {
	// the session the Clerk proxy verified: no call to the Clerk API
	const { userId } = await auth()

	if (!userId) {
		console.error('User not authenticated')
		throw new Error('Unauthorized')
	}

	const userData = await prisma.user.findUnique({
		where: {
			clerkId: userId,
		},
	})

	// no DB row yet (createUser not run) means no credit either
	if (!userData || userData.credits <= 0) {
		console.error('No credits left')
		throw new Error('No credits left')
	}

	if (!formData || typeof formData.get !== 'function') {
		return { error: 'Invalid playground form data', status: 400 }
	}

	const file = formData.get('image')
	if (!file) {
		console.error('No file uploaded')
		throw new Error('No file uploaded')
	}

	// same limits as the API: a schema with too many or too long fields is
	// refused before any credit is charged
	let schema
	let data
	try {
		data = parsePlaygroundData(formData.get('data'))
		schema = normalizeDescribeSchema(data.schema)
	} catch (error) {
		if (error instanceof InvalidDescribeInputError) {
			return { error: error.message, status: 400 }
		}
		throw error
	}

	const release = acquireDescribeSlot(userId)
	if (!release) {
		return { error: TOO_MANY_AT_ONCE, status: 429 }
	}
	try {
		return await describeForUser(userId, file, data, schema)
	} finally {
		release()
	}
}

async function describeForUser(userId, file, data, schema) {
	const context = data.context || ''
	const keywords = data.keywords || ''
	const language = data.language || 'en'

	let base64Image
	try {
		base64Image = await blobToBase64(file)
	} catch (error) {
		// the reason is shown in the playground, same statuses as the API
		if (error instanceof ImageTooLargeError || error instanceof ImageDimensionsTooLargeError) {
			return { error: error.message, status: 413 }
		}
		if (error instanceof UnsupportedImageError) {
			return { error: error.message, status: 400 }
		}
		throw error
	}

	// Get image description using base64 encoded image. One credit is reserved
	// atomically before the generation and refunded if it fails.
	let description
	try {
		description = await chargeOneCredit(userId, { reason: 'describe from PlaygroundAction' }, () =>
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
		if (error instanceof TooManyTooLongDescriptionsError) {
			return { error: error.message, status: 429 }
		}
		throw error
	}

	// Return the description as a directly usable JSON object
	return {
		data: description,
		status: 200,
	}
}

function parsePlaygroundData(value) {
	let data
	try {
		data = JSON.parse(value || '{}')
	} catch {
		throw new InvalidDescribeInputError('Invalid playground data: expected a JSON object')
	}
	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		throw new InvalidDescribeInputError('Invalid playground data: expected a JSON object')
	}
	return data
}
