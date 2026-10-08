import {
	InvalidDescribeInputError,
	normalizeDescribeSchema,
	withLegacyAltText,
} from '@/helpers/describeInput'
import {
	chargeOneCredit,
	findActiveApiToken,
	NoCreditsLeftError,
} from '@/services/database.service'
import {
	blobToBase64,
	getImageDescription,
} from '@/services/imageDescription.service'
import { verifyJwt } from '@/services/jwt.service'
import { prisma } from '@/services/prisma.service'

export async function POST(request) {
	// Process multipart/form-data containing an image and a JSON schema.
	try {
		// get the authorisation header (never log it: it carries the API key)
		const authorization = request.headers.get('Authorization')
		if (
			!authorization ||
			!authorization.startsWith('Bearer ') ||
			authorization.length < 10
		) {
			console.error('Unauthorized, missing Authorization header')
			return jsonError('Unauthorized, missing Authorization header', 401)
		}
		const jwt = authorization.slice('Bearer '.length).trim()

		// check if the token is signed by us
		let payload
		try {
			payload = await verifyJwt(jwt)
		} catch (error) {
			console.error('Unauthorized, invalid token:', error.message)
			return jsonError('Unauthorized, invalid token', 401)
		}

		// check if the API key still exists (not deleted from the dashboard),
		// belongs to the token's user and has not expired
		const apiToken = await findActiveApiToken(jwt, payload.userId)
		if (!apiToken) {
			console.error(
				'Unauthorized, revoked or expired token, user:',
				payload.userId
			)
			return jsonError('Unauthorized, invalid token', 401)
		}

		// fail fast when the user has no credit left (the charge below is the
		// authoritative, atomic check)
		const user = await prisma.user.findUnique({
			where: {
				clerkId: payload.userId,
			},
		})

		if (!user || user.credits <= 0) {
			console.error('Unauthorized, no credit left, user:', payload.userId)
			return jsonError('Unauthorized, no credit left', 401)
		}

		const formData = await request.formData()

		const file = formData.get('image')
		if (!file) {
			return jsonError('Bad Request, No file uploaded', 400)
		}

		// Check if the uploaded file is an image
		if (!isValidImageFile(file)) {
			return jsonError('Bad Request, Invalid image file', 400)
		}

		const context = formData.get('context') || ''
		const keywords = formData.get('keywords') || ''
		const language = formData.get('language') || 'en' // Default language is English

		// Flat map key -> description; empty or unparseable means the default
		// fields, too many or too long fields are a 400 (no credit charged)
		const sentSchema = formData.get('schema')
		let schema
		try {
			schema = normalizeDescribeSchema(sentSchema)
		} catch (error) {
			if (error instanceof InvalidDescribeInputError) {
				return jsonError(error.message, 400, 'Bad Request')
			}
			throw error
		}

		let base64Image
		try {
			base64Image = await blobToBase64(file)
		} catch (error) {
			// e.g. "Image processing failed: Image size exceeds the maximum limit
			// of 10 MB". Same status as before (500), but a readable message.
			console.error('Error processing the image:', error.message)
			return jsonError(error.message, 500, 'Internal Server Error')
		}

		// one credit is reserved atomically, refunded if the generation fails
		const descriptionResult = await chargeOneCredit(
			payload.userId,
			{
				reason: 'decrement token from Describe Action',
				tokenId: apiToken.id,
			},
			() =>
				getImageDescription(base64Image, {
					language,
					keywords,
					context,
					schema,
				})
		)

		// no `schema` field: WordPress plugin <= 1.1.40 reads `alt_text`
		return Response.json(
			sentSchema === null
				? withLegacyAltText(descriptionResult)
				: descriptionResult,
			{ status: 200 }
		)
	} catch (error) {
		if (error instanceof NoCreditsLeftError) {
			return jsonError('Unauthorized, no credit left', 401)
		}
		console.error('Error processing the request:', error)
		return jsonError('Internal Server Error', 500)
	}
}

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

// Error responses are JSON `{ "error": "<human message>" }` (the WordPress
// plugin parses them); the status codes are unchanged.
function jsonError(message, status, statusText = message) {
	return Response.json({ error: message }, { statusText, status })
}
