import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/describe/route'

import {
	blobToBase64,
	getImageDescription,
	UnsupportedImageError,
} from '@/services/imageDescription.service'
import { defaultJsonTemplateSchema } from '@/constants/playground'
import { DescriptionTooLongError } from '@/helpers/describeInput'
import { verifyJwt } from '@/services/jwt.service'

// The real database.service runs against the mocked Prisma client, so these
// tests also cover the token lookup and the atomic credit charge.
// the image and the model are stubbed, the error classes are the real ones
vi.mock('@/services/imageDescription.service', async importOriginal => ({
	...(await importOriginal()),
	getImageDescription: vi.fn(),
	blobToBase64: vi.fn(),
}))
vi.mock('@/services/jwt.service')
vi.mock('@clerk/nextjs/server')

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})

const JWT = 'header.payload.signature-of-the-api-key'

describe('describe API', () => {
	let consoleError
	let consoleInfo

	beforeEach(() => {
		vi.resetAllMocks()
		consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {})
		// batch transactions resolve their queries in order
		prisma.$transaction.mockImplementation(queries => Promise.all(queries))
	})

	afterEach(() => {
		consoleError.mockRestore()
		consoleInfo.mockRestore()
	})

	const mockRequest = (headers, formData) => {
		return {
			formData: async () => formData,
			headers: new Map(headers),
		}
	}
	const authHeader = [['Authorization', `Bearer ${JWT}`]]

	const mockUser = { clerkId: 'user123', credits: 10 }
	const mockPayload = { userId: 'user123' }
	const mockToken = {
		expiredAt: new Date(Date.now() + 24 * 3600 * 1000),
		userId: 'user123',
		id: 'token-1',
		jwt: JWT,
	}
	const mockFile = new Blob(['image content'], { type: 'image/png' })
	const mockBase64Image = 'base64ImageString'
	const mockDescription = {
		alternativeText: 'Alt Text',
		title: 'Image Title',
		caption: 'Caption',
	}

	// valid signature, key still in the Token table, user with credits
	function givenValidApiKey({ token = mockToken, user = mockUser } = {}) {
		verifyJwt.mockResolvedValue(mockPayload)
		prisma.token.findUnique.mockResolvedValue(token)
		prisma.user.findUnique.mockResolvedValue(user)
	}

	function givenCreditReserved(creditsAfter = 9) {
		prisma.user.updateMany.mockResolvedValue({ count: 1 })
		// 1st findUnique: route's fast check, 2nd: inside the charge transaction
		prisma.user.findUnique
			.mockResolvedValueOnce(mockUser)
			.mockResolvedValueOnce({ credits: creditsAfter })
	}

	function imageForm() {
		const formData = new FormData()
		formData.append('image', mockFile)
		return formData
	}

	async function expectJsonError(response, status, error) {
		expect(response.status).toBe(status)
		expect(response.headers.get('Content-Type')).toContain('application/json')
		expect(await response.json()).toEqual({ error })
	}

	function expectAuthorizationNeverLogged() {
		const logged = [...consoleError.mock.calls, ...consoleInfo.mock.calls]
			.flat()
			.map(argument => String(argument?.message ?? argument))
			.join('\n')
		expect(logged).not.toContain(JWT)
	}

	describe('authentication', () => {
		it('should return 401 JSON if the Authorization header is missing', async () => {
			const response = await POST(mockRequest([], new FormData()))

			await expectJsonError(
				response,
				401,
				'Unauthorized, missing Authorization header'
			)
			expect(response.statusText).toBe(
				'Unauthorized, missing Authorization header'
			)
		})

		it('should return 401 JSON if the token signature is invalid, without logging the header', async () => {
			verifyJwt.mockRejectedValue(
				new Error('Token is not signed by the server')
			)

			const response = await POST(mockRequest(authHeader, new FormData()))

			await expectJsonError(response, 401, 'Unauthorized, invalid token')
			expect(prisma.token.findUnique).not.toHaveBeenCalled()
			expectAuthorizationNeverLogged()
		})

		it('should return 401 JSON for a deleted API key even if its signature is valid', async () => {
			givenValidApiKey({ token: null })

			const response = await POST(mockRequest(authHeader, imageForm()))

			await expectJsonError(response, 401, 'Unauthorized, invalid token')
			expect(prisma.token.findUnique).toHaveBeenCalledWith({
				where: { jwt: JWT },
			})
			expect(prisma.user.updateMany).not.toHaveBeenCalled()
			expect(getImageDescription).not.toHaveBeenCalled()
			expectAuthorizationNeverLogged()
		})

		it('should return 401 JSON if the API key belongs to another user', async () => {
			givenValidApiKey({ token: { ...mockToken, userId: 'someone-else' } })

			const response = await POST(mockRequest(authHeader, imageForm()))

			await expectJsonError(response, 401, 'Unauthorized, invalid token')
			expect(getImageDescription).not.toHaveBeenCalled()
		})

		it('should return 401 JSON if the API key is expired in the database', async () => {
			givenValidApiKey({
				token: { ...mockToken, expiredAt: new Date(Date.now() - 1000) },
			})

			const response = await POST(mockRequest(authHeader, imageForm()))

			await expectJsonError(response, 401, 'Unauthorized, invalid token')
			expect(getImageDescription).not.toHaveBeenCalled()
		})

		it('should return 401 JSON if the user has no credits left', async () => {
			givenValidApiKey({ user: { ...mockUser, credits: 0 } })

			const response = await POST(mockRequest(authHeader, imageForm()))

			await expectJsonError(response, 401, 'Unauthorized, no credit left')
			expect(response.statusText).toBe('Unauthorized, no credit left')
		})
	})

	describe('validation', () => {
		it('should return 400 JSON if no file is uploaded', async () => {
			givenValidApiKey()

			const response = await POST(mockRequest(authHeader, new FormData()))

			await expectJsonError(response, 400, 'Bad Request, No file uploaded')
			expect(prisma.user.updateMany).not.toHaveBeenCalled()
		})

		it('should return 400 JSON if the uploaded file is not a supported image, without charging', async () => {
			givenValidApiKey()
			blobToBase64.mockRejectedValue(new UnsupportedImageError())

			const response = await POST(mockRequest(authHeader, imageForm()))

			await expectJsonError(response, 400, 'Bad Request, Invalid image file')
			expect(prisma.user.updateMany).not.toHaveBeenCalled()
			expect(getImageDescription).not.toHaveBeenCalled()
		})

		it('should return 400 JSON if the image is sent as a text field', async () => {
			givenValidApiKey()
			const formData = new FormData()
			formData.append('image', 'not a file')

			const response = await POST(mockRequest(authHeader, formData))

			await expectJsonError(response, 400, 'Bad Request, Invalid image file')
			expect(blobToBase64).not.toHaveBeenCalled()
			expect(prisma.user.updateMany).not.toHaveBeenCalled()
		})

		it('should return 400 JSON for a schema with more than 20 fields, without charging', async () => {
			givenValidApiKey()
			const formData = imageForm()
			formData.append(
				'schema',
				JSON.stringify(
					Object.fromEntries(
						Array.from({ length: 21 }, (_, index) => [`field${index}`, 'text'])
					)
				)
			)

			const response = await POST(mockRequest(authHeader, formData))

			await expectJsonError(
				response,
				400,
				'Invalid schema: at most 20 fields are allowed'
			)
			expect(response.statusText).toBe('Bad Request')
			expect(prisma.user.updateMany).not.toHaveBeenCalled()
			expect(blobToBase64).not.toHaveBeenCalled()
			expect(getImageDescription).not.toHaveBeenCalled()
		})

		it('should return 400 JSON for a schema field name over 64 characters', async () => {
			givenValidApiKey()
			const formData = imageForm()
			formData.append('schema', JSON.stringify({ ['k'.repeat(65)]: 'text' }))

			const response = await POST(mockRequest(authHeader, formData))

			await expectJsonError(
				response,
				400,
				'Invalid schema: field names must be at most 64 characters'
			)
			expect(prisma.user.updateMany).not.toHaveBeenCalled()
		})

		it('should keep 500 but return a readable JSON error when the image is too large', async () => {
			givenValidApiKey()
			blobToBase64.mockRejectedValue(
				new Error(
					'Image processing failed: Image size exceeds the maximum limit of 10 MB'
				)
			)

			const response = await POST(mockRequest(authHeader, imageForm()))

			await expectJsonError(
				response,
				500,
				'Image processing failed: Image size exceeds the maximum limit of 10 MB'
			)
			expect(prisma.user.updateMany).not.toHaveBeenCalled()
			expect(getImageDescription).not.toHaveBeenCalled()
		})
	})

	describe('credits', () => {
		it('should return the description and charge exactly one credit atomically', async () => {
			givenValidApiKey()
			givenCreditReserved(9)
			blobToBase64.mockResolvedValue(mockBase64Image)
			getImageDescription.mockResolvedValue(mockDescription)

			const response = await POST(mockRequest(authHeader, imageForm()))

			expect(response.status).toBe(200)
			expect(response.headers.get('Content-Type')).toContain('application/json')
			expect(await response.json()).toEqual({
				...mockDescription,
				alt_text: 'Alt Text',
			})
			expect(prisma.user.updateMany).toHaveBeenCalledTimes(1)
			expect(prisma.user.updateMany).toHaveBeenCalledWith({
				where: { credits: { gte: 1 }, clerkId: 'user123' },
				data: { credits: { decrement: 1 } },
			})
			expect(prisma.usage.create).toHaveBeenCalledWith({
				data: {
					reason: 'decrement token from Describe Action',
					previousCredits: 10,
					tokenId: 'token-1',
					userId: 'user123',
					currentCredits: 9,
					used: -1,
				},
			})
			// no read-then-write of the balance
			expect(prisma.user.update).not.toHaveBeenCalled()
		})

		it('should return 401 JSON without generating when a parallel request spent the last credit', async () => {
			givenValidApiKey({ user: { ...mockUser, credits: 1 } })
			prisma.user.updateMany.mockResolvedValue({ count: 0 })
			blobToBase64.mockResolvedValue(mockBase64Image)

			const response = await POST(mockRequest(authHeader, imageForm()))

			await expectJsonError(response, 401, 'Unauthorized, no credit left')
			expect(getImageDescription).not.toHaveBeenCalled()
			expect(prisma.usage.create).not.toHaveBeenCalled()
		})

		it('should refund the credit and return 500 JSON when the generation fails', async () => {
			givenValidApiKey()
			givenCreditReserved(9)
			blobToBase64.mockResolvedValue(mockBase64Image)
			getImageDescription.mockRejectedValue(new Error('model unavailable'))

			const response = await POST(mockRequest(authHeader, imageForm()))

			await expectJsonError(response, 500, 'Internal Server Error')
			expect(prisma.user.update).toHaveBeenCalledWith({
				data: { credits: { increment: 1 } },
				where: { clerkId: 'user123' },
			})
			expect(prisma.usage.create).not.toHaveBeenCalled()
			expectAuthorizationNeverLogged()
		})

		it('should refund the credit and return 400 JSON when the answer for the schema is too long', async () => {
			givenValidApiKey()
			givenCreditReserved(9)
			blobToBase64.mockResolvedValue(mockBase64Image)
			getImageDescription.mockRejectedValue(new DescriptionTooLongError())

			const response = await POST(mockRequest(authHeader, imageForm()))

			await expectJsonError(
				response,
				400,
				new DescriptionTooLongError().message
			)
			expect(response.statusText).toBe('Bad Request')
			expect(prisma.user.update).toHaveBeenCalledWith({
				data: { credits: { increment: 1 } },
				where: { clerkId: 'user123' },
			})
			expect(prisma.usage.create).not.toHaveBeenCalled()
		})

		it('should pass the multipart fields to the generation', async () => {
			givenValidApiKey()
			givenCreditReserved()
			blobToBase64.mockResolvedValue(mockBase64Image)
			getImageDescription.mockResolvedValue(mockDescription)
			const schemaObject = {
				alternativeText: 'Alt description',
				caption: 'Caption description',
				title: 'Title description',
			}
			const formData = imageForm()
			formData.append('schema', JSON.stringify(schemaObject))
			formData.append('context', 'Test Context')
			formData.append('keywords', 'test, keywords')

			const response = await POST(mockRequest(authHeader, formData))

			expect(response.status).toBe(200)
			expect(getImageDescription).toHaveBeenCalledWith(
				mockBase64Image,
				expect.objectContaining({
					keywords: 'test, keywords',
					context: 'Test Context',
					schema: schemaObject,
					language: 'en',
				})
			)
			// exactly the keys of the schema that was sent, no `alt_text` copy
			expect(await response.json()).toEqual(mockDescription)
		})

		it('should generate the default fields when no schema is sent', async () => {
			givenValidApiKey()
			givenCreditReserved()
			blobToBase64.mockResolvedValue(mockBase64Image)
			getImageDescription.mockResolvedValue(mockDescription)
			const formData = imageForm()
			formData.append('language', 'fr')

			const response = await POST(mockRequest(authHeader, formData))

			expect(response.status).toBe(200)
			expect(getImageDescription).toHaveBeenCalledWith(mockBase64Image, {
				schema: defaultJsonTemplateSchema,
				language: 'fr',
				keywords: '',
				context: '',
			})
		})

		it('should also return alt_text when no schema is sent (WordPress plugin <= 1.1.40)', async () => {
			givenValidApiKey()
			givenCreditReserved()
			blobToBase64.mockResolvedValue(mockBase64Image)
			getImageDescription.mockResolvedValue(mockDescription)
			const formData = imageForm()
			formData.append('context', '')
			formData.append('language', 'en')

			const response = await POST(mockRequest(authHeader, formData))

			expect(response.status).toBe(200)
			expect(await response.json()).toEqual({
				alternativeText: 'Alt Text',
				title: 'Image Title',
				alt_text: 'Alt Text',
				caption: 'Caption',
			})
			expect(prisma.user.updateMany).toHaveBeenCalledTimes(1)
		})

		it('should not add alt_text when a schema field is sent, even an empty one', async () => {
			givenValidApiKey()
			givenCreditReserved()
			blobToBase64.mockResolvedValue(mockBase64Image)
			getImageDescription.mockResolvedValue(mockDescription)
			const formData = imageForm()
			formData.append('schema', '')

			const response = await POST(mockRequest(authHeader, formData))

			expect(response.status).toBe(200)
			expect(getImageDescription).toHaveBeenCalledWith(
				mockBase64Image,
				expect.objectContaining({ schema: defaultJsonTemplateSchema })
			)
			expect(await response.json()).toEqual(mockDescription)
		})
	})
})
