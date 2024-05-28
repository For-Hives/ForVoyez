import {
	createToken,
	deleteToken,
	getAllToken,
} from '@/app/actions/tokens/TokensCRUD'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { currentUser } from '@clerk/nextjs/server'

import { generateJwt } from '@/services/jwt.service'

vi.mock('@clerk/nextjs/server')
vi.mock('@/services/jwt.service')

import { prisma } from '/tests/unit/mocks/prisma.mock'

vi.mock('@/services/prisma.service', async () => {
	const actual = await vi.importActual('/tests/unit/mocks/prisma.mock')
	return {
		...actual,
	}
})
describe('TokensCRUD', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	const mockUser = { id: 'user123' }

	describe('createToken', () => {
		it('should throw an error if the user is not authenticated', async () => {
			currentUser.mockResolvedValue(null)

			await expect(
				createToken({
					createdAt: new Date(),
					expiredAt: new Date(),
					name: 'test',
				})
			).rejects.toThrow('You must be logged in to create a token')
		})

		it('should create a new token and return it with a shortened JWT', async () => {
			const mockToken = {
				createdAt: new Date(),
				expiredAt: new Date(),
				name: 'test',
			}
			const mockJwt = 'jwtTokenString'
			const mockResult = {
				id: 'token123',
				...mockToken,
				userId: mockUser.id,
				jwt: mockJwt,
			}

			currentUser.mockResolvedValue(mockUser)
			generateJwt.mockResolvedValue(mockJwt)
			prisma.token.create.mockResolvedValue(mockResult)

			const result = await createToken(mockToken)

			expect(result).toEqual({
				...mockResult,
				jwt_shortened: 'jwtTo*****tring',
			})
			expect(prisma.token.create).toHaveBeenCalledWith({
				data: {
					createdAt: mockToken.createdAt,
					expiredAt: mockToken.expiredAt,
					name: mockToken.name,
					userId: mockUser.id,
					jwt: mockJwt,
				},
			})
		})
	})

	describe('getAllToken', () => {
		it('should throw an error if the user is not authenticated', async () => {
			currentUser.mockResolvedValue(null)

			await expect(getAllToken()).rejects.toThrow(
				'You must be logged in to view tokens'
			)
		})

		it('should return all tokens for the authenticated user with shortened JWTs', async () => {
			const mockTokens = [
				{ userId: mockUser.id, jwt: 'jwtToken1', id: 'token1' },
				{ userId: mockUser.id, jwt: 'jwtToken2', id: 'token2' },
			]

			currentUser.mockResolvedValue(mockUser)
			prisma.token.findMany.mockResolvedValue(mockTokens)

			const result = await getAllToken()

			expect(result).toEqual([
				{ ...mockTokens[0], jwt: 'jwtTo*****oken1' },
				{ ...mockTokens[1], jwt: 'jwtTo*****oken2' },
			])
			expect(prisma.token.findMany).toHaveBeenCalledWith({
				where: {
					userId: mockUser.id,
				},
			})
		})
	})

	describe('deleteToken', () => {
		it('should throw an error if the user is not authenticated', async () => {
			currentUser.mockResolvedValue(null)

			await expect(deleteToken('token123')).rejects.toThrow(
				'You must be logged in to delete a token'
			)
		})

		it('should throw an error if the token does not belong to the authenticated user', async () => {
			const mockToken = { userId: 'differentUser', id: 'token123' }

			currentUser.mockResolvedValue(mockUser)
			prisma.token.findUnique.mockResolvedValue(mockToken)

			await expect(deleteToken('token123')).rejects.toThrow(
				'You do not have permission to delete this token'
			)
		})

		it('should delete the token if it belongs to the authenticated user', async () => {
			const mockToken = { userId: mockUser.id, id: 'token123' }

			currentUser.mockResolvedValue(mockUser)
			prisma.token.findUnique.mockResolvedValue(mockToken)
			prisma.token.delete.mockResolvedValue(mockToken)

			const result = await deleteToken('token123')

			expect(result).toEqual(mockToken)
			expect(prisma.token.delete).toHaveBeenCalledWith({
				where: { id: 'token123' },
			})
		})
	})
})
