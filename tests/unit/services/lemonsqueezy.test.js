import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import * as lemonsqueezy from '@lemonsqueezy/lemonsqueezy.js'
import * as clerk from '@clerk/nextjs/server'

import {
	getCheckoutURL,
	getCustomerPortalLink,
	getVariant,
	initLemonSqueezy,
	listPrice,
	listProducts,
} from '@/services/lemonsqueezy.service'
import { getCustomerIdFromUser } from '@/services/database.service'

vi.mock('@lemonsqueezy/lemonsqueezy.js')
vi.mock('@clerk/nextjs/server')
vi.mock('@/services/database.service')

const STORE_ID = '1234'

describe('Lemon Squeezy Service', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		vi.stubEnv('LEMON_SQUEEZY_STORE_ID', STORE_ID)
		process.env.LEMON_SQUEEZY_API_KEY = 'test-api-key'
	})

	describe('initLemonSqueezy', () => {
		it('should initialize Lemon Squeezy with the correct API key', async () => {
			await initLemonSqueezy()
			expect(lemonsqueezy.lemonSqueezySetup).toHaveBeenCalledWith({
				onError: expect.any(Function),
				apiKey: 'test-api-key',
			})
		})
	})

	describe('listProducts', () => {
		it('should list products from Lemon Squeezy', async () => {
			const mockData = { data: { data: [{ id: 'product1' }] }, statusCode: 200 }
			lemonsqueezy.listProducts.mockResolvedValue(mockData)

			const products = await listProducts()

			expect(products).toEqual(mockData.data.data)
			expect(lemonsqueezy.listProducts).toHaveBeenCalledWith({
				filter: { storeId: STORE_ID },
				include: ['variants'],
			})
		})

		it('should throw an error if listing products fails', async () => {
			const mockError = { error: 'Some error', statusCode: 400 }
			lemonsqueezy.listProducts.mockResolvedValue(mockError)

			await expect(listProducts()).rejects.toThrow('Some error')
		})
	})

	describe('listPrice', () => {
		it('should list prices for a given variant', async () => {
			const mockData = { data: { data: [{ id: 'price1' }] }, statusCode: 200 }
			lemonsqueezy.listPrices.mockResolvedValue(mockData)

			const prices = await listPrice('variant1')

			expect(prices).toEqual(mockData.data.data)
			expect(lemonsqueezy.listPrices).toHaveBeenCalledWith({
				filter: { variantId: 'variant1' },
			})
		})

		it('should throw an error if listing prices fails', async () => {
			const mockError = { error: 'Some error', statusCode: 400 }
			lemonsqueezy.listPrices.mockResolvedValue(mockError)

			await expect(listPrice('variant1')).rejects.toThrow('Some error')
		})
	})

	describe('getCheckoutURL', () => {
		it('should create a checkout URL for the authenticated user', async () => {
			const mockUser = { id: 'user123' }
			const mockCheckout = {
				data: { data: { attributes: { url: 'http://checkout.url' } } },
			}
			clerk.currentUser.mockResolvedValue(mockUser)
			lemonsqueezy.createCheckout.mockResolvedValue(mockCheckout)

			const checkoutURL = await getCheckoutURL('variant1', false)

			expect(checkoutURL).toBe('http://checkout.url')
			expect(lemonsqueezy.createCheckout).toHaveBeenCalledWith(
				STORE_ID,
				'variant1',
				{
					productOptions: {
						receiptButtonText: 'Go to Dashboard',
						enabledVariants: ['variant1'],
					},
					checkoutOptions: {
						media: false,
						embed: false,
						logo: true,
					},
					checkoutData: {
						custom: {
							user_id: 'user123',
						},
					},
				}
			)
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.currentUser.mockResolvedValue(null)

			await expect(getCheckoutURL('variant1', false)).rejects.toThrow(
				'User is not authenticated.'
			)
		})
	})

	describe('getCustomerPortalLink', () => {
		it('should get the customer portal link for the authenticated user', async () => {
			const mockUser = { id: 'user123' }
			const mockCustomerId = 'customer123'
			const mockCustomer = {
				data: {
					data: {
						attributes: { urls: { customer_portal: 'http://portal.url' } },
					},
				},
			}
			clerk.currentUser.mockResolvedValue(mockUser)
			getCustomerIdFromUser.mockResolvedValue(mockCustomerId)
			lemonsqueezy.getCustomer.mockResolvedValue(mockCustomer)

			const portalLink = await getCustomerPortalLink()

			expect(portalLink).toBe('http://portal.url')
			expect(getCustomerIdFromUser).toHaveBeenCalledWith('user123')
			expect(lemonsqueezy.getCustomer).toHaveBeenCalledWith(mockCustomerId)
		})

		it('should throw an error if the user is not authenticated', async () => {
			clerk.currentUser.mockResolvedValue(null)

			await expect(getCustomerPortalLink()).rejects.toThrow(
				'User is not authenticated.'
			)
		})

		it('should throw an error if the customer ID is not found', async () => {
			const mockUser = { id: 'user123' }
			clerk.currentUser.mockResolvedValue(mockUser)
			getCustomerIdFromUser.mockResolvedValue(null)

			await expect(getCustomerPortalLink()).rejects.toThrow(
				'Customer not found.'
			)
		})
	})

	describe('getVariant', () => {
		it('should get variant details from Lemon Squeezy', async () => {
			const mockData = { data: { id: 'variant1' }, statusCode: 200 }
			lemonsqueezy.getVariant.mockResolvedValue(mockData)

			const variant = await getVariant('variant1')

			expect(variant).toEqual({ id: 'variant1' })
			expect(lemonsqueezy.getVariant).toHaveBeenCalledWith('variant1')
		})

		it('should throw an error if getting variant details fails', async () => {
			const mockError = { error: 'Some error', statusCode: 400 }
			lemonsqueezy.getVariant.mockResolvedValue(mockError)

			await expect(getVariant('variant1')).rejects.toThrow('Some error')
		})
	})
})