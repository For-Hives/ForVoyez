import {
	blobToBase64,
	getImageDescription,
	ImageTooLargeError,
	UnsupportedImageError,
} from '@/services/imageDescription.service'
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
import { verifyJwt } from '@/services/jwt.service'
import { prisma } from '@/services/prisma.service'

const INVALID_IMAGE = 'Bad Request, Invalid image file'
const IMAGE_TOO_LARGE = 'Image too large: the maximum is 10 MB'

// A 10 MB image plus the multipart framing and the text fields (the schema
// is at most about 21 KB). Bigger bodies are refused before being parsed.
const MAX_BODY_BYTES = 11 * 1024 * 1024

class PayloadTooLargeError extends Error {}

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

		// 413 before reading a body that cannot hold a 10 MB image, 400 when
		// it is not a multipart/form-data body; no credit is charged
		let formData
		try {
			formData = await readFormData(request)
		} catch (error) {
			if (error instanceof PayloadTooLargeError) {
				return jsonError(IMAGE_TOO_LARGE, 413, 'Payload Too Large')
			}
			console.error('Unreadable multipart body:', error.name)
			return jsonError(
				'Bad Request, the body must be multipart/form-data',
				400,
				'Bad Request'
			)
		}

		const file = formData.get('image')
		if (!file) {
			return jsonError('Bad Request, No file uploaded', 400)
		}

		// a text field, not a file (the image format itself is read from the
		// bytes below, whatever MIME type the file was sent with)
		if (typeof file === 'string') {
			return jsonError(INVALID_IMAGE, 400)
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
			// not a JPEG, PNG, WebP or GIF image: same answer as before for a
			// file sent with another MIME type
			if (error instanceof UnsupportedImageError) {
				return jsonError(INVALID_IMAGE, 400)
			}
			if (error instanceof ImageTooLargeError) {
				return jsonError(IMAGE_TOO_LARGE, 413, 'Payload Too Large')
			}
			// e.g. "Image processing failed: ...". Same status as before (500),
			// but a readable message.
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
		// e.g. a schema that needs a longer answer than the output cap (the
		// credit was refunded)
		if (error instanceof InvalidDescribeInputError) {
			return jsonError(error.message, 400, 'Bad Request')
		}
		console.error('Error processing the request:', error)
		return jsonError('Internal Server Error', 500)
	}
}

// Error responses are JSON `{ "error": "<human message>" }` (the WordPress
// plugin parses them); the status codes are unchanged.
function jsonError(message, status, statusText = message) {
	return Response.json({ error: message }, { statusText, status })
}

// The multipart body, at most MAX_BODY_BYTES. A declared Content-Length is
// checked before reading anything (Node then reads exactly that many bytes);
// a body sent without one (chunked) is counted while it is read.
async function readFormData(request) {
	const declaredLength = request.headers.get('content-length')
	if (Number(declaredLength) > MAX_BODY_BYTES) {
		throw new PayloadTooLargeError()
	}
	if (declaredLength !== null || !request.body) {
		return request.formData()
	}

	const chunks = []
	let size = 0
	for await (const chunk of request.body) {
		size += chunk.byteLength
		if (size > MAX_BODY_BYTES) {
			// leaving the loop cancels the rest of the upload
			throw new PayloadTooLargeError()
		}
		chunks.push(chunk)
	}
	return new Response(new Blob(chunks), {
		headers: { 'Content-Type': request.headers.get('content-type') ?? '' },
	}).formData()
}
