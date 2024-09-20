import { describePlaygroundAction } from '@/app/actions/app/playground'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { currentUser } from '@clerk/nextjs/server'

import {
	blobToBase64,
	getImageDescription,
} from '@/services/imageDescription.service'
import { decrementCredit } from '@/services/database.service'

vi.mock('@clerk/nextjs/server')
vi.mock('@/services/imageDescription.service')
vi.mock('@/services/database.service')
vi.mock('@/services/prisma.service')

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})

describe('describePlaygroundAction', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('should throw an error if the user is not authenticated', async () => {
		currentUser.mockResolvedValue(null)

		await expect(describePlaygroundAction(new FormData())).rejects.toThrow(
			'Unauthorized'
		)
	})

	it('should throw an error if the user has no credits left', async () => {
		const mockUser = { id: 'user123' }
		currentUser.mockResolvedValue(mockUser)
		prisma.user.findUnique.mockResolvedValue({ clerkId: 'user123', credits: 0 })

		await expect(describePlaygroundAction(new FormData())).rejects.toThrow(
			'No credits left'
		)
	})

	it('should throw an error if no file is uploaded', async () => {
		const mockUser = { id: 'user123' }
		currentUser.mockResolvedValue(mockUser)
		prisma.user.findUnique.mockResolvedValue({
			clerkId: 'user123',
			credits: 10,
		})

		const formData = new FormData()

		await expect(describePlaygroundAction(formData)).rejects.toThrow(
			'No file uploaded'
		)
	})

	it('should return the image description and decrement the user credits', async () => {
		const mockUser = { id: 'user123' }
		const mockFile = new Blob(['image content'], { type: 'image/png' })
		const mockBase64Image = 'base64ImageString'
		const mockDescription = {
			title: 'Image Title',
			caption: 'Caption',
			alt: 'Alt Text',
		}

		currentUser.mockResolvedValue(mockUser)
		prisma.user.findUnique.mockResolvedValue({
			clerkId: 'user123',
			credits: 10,
		})
		blobToBase64.mockResolvedValue(mockBase64Image)
		getImageDescription.mockResolvedValue(mockDescription)

		const formData = new FormData()
		formData.append('image', mockFile)
		formData.append(
			'data',
			JSON.stringify({ context: 'Test Context', language: 'fr', schema: {} })
		)

		const result = await describePlaygroundAction(formData)

		expect(result).toEqual({
			data: mockDescription,
			status: 200,
		})
		expect(decrementCredit).toHaveBeenCalledWith(
			'describe from PlaygroundAction'
		)
		expect(getImageDescription).toHaveBeenCalledWith(
			mockBase64Image,
			expect.objectContaining({
				context: 'Test Context',
				language: 'fr',
				schema: {},
			})
		)
	})

	it('should use default language if not provided', async () => {
		const mockUser = { id: 'user123' }
		const mockFile = new Blob(['image content'], { type: 'image/png' })
		const mockBase64Image = 'base64ImageString'
		const mockDescription = {
			title: 'Image Title',
			caption: 'Caption',
			alt: 'Alt Text',
		}

		currentUser.mockResolvedValue(mockUser)
		prisma.user.findUnique.mockResolvedValue({
			clerkId: 'user123',
			credits: 10,
		})
		blobToBase64.mockResolvedValue(mockBase64Image)
		getImageDescription.mockResolvedValue(mockDescription)

		const formData = new FormData()
		formData.append('image', mockFile)
		formData.append(
			'data',
			JSON.stringify({ context: 'Test Context', schema: {} })
		)

		await describePlaygroundAction(formData)

		expect(getImageDescription).toHaveBeenCalledWith(
			mockBase64Image,
			expect.objectContaining({
				context: 'Test Context',
				language: 'en',
				schema: {},
			})
		)
	})
})
