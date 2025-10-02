import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/describe/route'

import {
	blobToBase64,
	getImageDescription,
} from '@/services/imageDescription.service'
import {
	decrementCredit,
	decrementCreditFromAPI,
} from '@/services/database.service'
import { verifyJwt } from '@/services/jwt.service'

vi.mock('@/services/imageDescription.service')
vi.mock('@/services/database.service')
vi.mock('@/services/jwt.service')

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})

describe('describe API', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	const mockRequest = (headers, formData) => {
		return {
			formData: async () => formData,
			headers: new Map(headers),
		}
	}

	const mockUser = { id: 'user123', credits: 10 }
	const mockPayload = { userId: 'user123' }
	const mockFile = new Blob(['image content'], { type: 'image/png' })
	const mockBase64Image = 'base64ImageString'
	const mockDescription = {
		title: 'Image Title',
		caption: 'Caption',
		alt: 'Alt Text',
	}

	describe('POST', () => {
		it('should return 401 if the Authorization header is missing', async () => {
			const request = mockRequest([], new FormData())
			const response = await POST(request)

			expect(response.status).toBe(401)
			expect(response.statusText).toBe(
				'Unauthorized, missing Authorization header'
			)
		})

		it('should return 401 if the token is invalid', async () => {
			const request = mockRequest(
				[['Authorization', 'Bearer invalidtoken']],
				new FormData()
			)
			verifyJwt.mockRejectedValue(new Error('Invalid token'))

			const response = await POST(request)

			expect(response.status).toBe(401)
			expect(response.statusText).toBe('Unauthorized, invalid token')
		})

		it('should return 401 if the user has no credits left', async () => {
			const request = mockRequest(
				[['Authorization', 'Bearer validtoken']],
				new FormData()
			)
			verifyJwt.mockResolvedValue(mockPayload)
			prisma.user.findUnique.mockResolvedValue({ ...mockUser, credits: 0 })

			const response = await POST(request)

			expect(response.status).toBe(401)
			expect(response.statusText).toBe('Unauthorized, no credit left')
		})

		it('should return 400 if no file is uploaded', async () => {
			const formData = new FormData()
			const request = mockRequest(
				[['Authorization', 'Bearer validtoken']],
				formData
			)
			verifyJwt.mockResolvedValue(mockPayload)
			prisma.user.findUnique.mockResolvedValue(mockUser)

			const response = await POST(request)

			expect(response.status).toBe(400)
			expect(response.statusText).toBe('Bad Request, No file uploaded')
		})

		it('should return 400 if the uploaded file is not an image', async () => {
			const formData = new FormData()
			const invalidFile = new Blob(['not an image'], { type: 'text/plain' })
			formData.append('image', invalidFile)

			const request = mockRequest(
				[['Authorization', 'Bearer validtoken']],
				formData
			)
			verifyJwt.mockResolvedValue(mockPayload)
			prisma.user.findUnique.mockResolvedValue(mockUser)

			const response = await POST(request)

			expect(response.status).toBe(400)
			expect(response.statusText).toBe('Bad Request, Invalid image file')
		})

		it('should process the image and return the description', async () => {
			const formData = new FormData()
			formData.append('image', mockFile)
			formData.append(
				'data',
				JSON.stringify({ context: 'Test Context', schema: {} })
			)

			const request = mockRequest(
				[['Authorization', 'Bearer validtoken']],
				formData
			)
			verifyJwt.mockResolvedValue(mockPayload)
			prisma.user.findUnique.mockResolvedValue(mockUser)
			blobToBase64.mockResolvedValue(mockBase64Image)
			getImageDescription.mockResolvedValue(mockDescription)

			const response = await POST(request)
			const result = await response.json()

			expect(response.status).toBe(200)
			expect(result).toEqual(mockDescription)
			expect(decrementCreditFromAPI).toHaveBeenCalledWith(
				mockUser.id,
				'decrement token from Describe Action',
				'validtoken'
			)
		})

		it('should parse schema string from FormData', async () => {
			const formData = new FormData()
			const schemaObject = {
				alternativeText: 'Alt description',
				caption: 'Caption description',
				title: 'Title description',
			}
			formData.append('image', mockFile)
			formData.append('schema', JSON.stringify(schemaObject))
			formData.append('context', 'Test Context')
			formData.append('language', 'en')
			formData.append('keywords', 'test, keywords')

			const request = mockRequest(
				[['Authorization', 'Bearer validtoken']],
				formData
			)
			verifyJwt.mockResolvedValue(mockPayload)
			prisma.user.findUnique.mockResolvedValue(mockUser)
			blobToBase64.mockResolvedValue(mockBase64Image)
			getImageDescription.mockResolvedValue(mockDescription)

			const response = await POST(request)
			const result = await response.json()

			expect(response.status).toBe(200)
			expect(result).toEqual(mockDescription)
			expect(getImageDescription).toHaveBeenCalledWith(
				mockBase64Image,
				expect.objectContaining({
					keywords: 'test, keywords',
					context: 'Test Context',
					schema: schemaObject,
					language: 'en',
				})
			)
		})

		it('should return 500 if an error occurs', async () => {
			const formData = new FormData()
			formData.append('image', mockFile)
			formData.append(
				'data',
				JSON.stringify({ context: 'Test Context', schema: {} })
			)

			const request = mockRequest(
				[['Authorization', 'Bearer validtoken']],
				formData
			)
			verifyJwt.mockResolvedValue(mockPayload)
			prisma.user.findUnique.mockResolvedValue(mockUser)
			blobToBase64.mockRejectedValue(new Error('Mocked error'))

			const response = await POST(request)

			expect(response.status).toBe(500)
			expect(response.statusText).toBe('Internal Server Error')
		})
	})
})
