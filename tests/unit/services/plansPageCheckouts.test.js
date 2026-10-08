import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as lemonsqueezy from '@lemonsqueezy/lemonsqueezy.js'
import * as clerk from '@clerk/nextjs/server'

import { createCheckoutLink } from '@/services/lemonsqueezy.service'

vi.mock('@lemonsqueezy/lemonsqueezy.js')
vi.mock('@clerk/nextjs/server')
vi.mock('@/services/database.service')

const STORE_ID = '1234'
const NOW = new Date('2026-10-08T10:00:00.000Z')
const CHECKOUT_URL = 'https://forvoyez.lemonsqueezy.com/checkout/custom/abc'

describe('createCheckoutLink', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		vi.useFakeTimers({ toFake: ['Date'], now: NOW })
		vi.stubEnv('LEMON_SQUEEZY_STORE_ID', STORE_ID)
		vi.stubEnv('LEMON_SQUEEZY_API_KEY', 'test-api-key')
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllEnvs()
	})

	it('creates one checkout with the options the plans page always used', async () => {
		lemonsqueezy.createCheckout.mockResolvedValue({
			data: { data: { attributes: { url: CHECKOUT_URL } } },
		})

		await expect(createCheckoutLink('365926', 'user_123')).resolves.toBe(
			CHECKOUT_URL
		)

		expect(lemonsqueezy.lemonSqueezySetup).toHaveBeenCalledWith({
			onError: expect.any(Function),
			apiKey: 'test-api-key',
		})
		expect(lemonsqueezy.createCheckout).toHaveBeenCalledTimes(1)
		expect(lemonsqueezy.createCheckout).toHaveBeenCalledWith(
			STORE_ID,
			'365926',
			{
				productOptions: {
					redirectUrl: `https://forvoyez.com/app/billing/`,
					receiptButtonText: 'Go to Dashboard',
					enabledVariants: ['365926'],
				},
				checkoutData: {
					custom: {
						user_id: 'user_123',
					},
				},
				// still expires 2 hours after its creation
				expiresAt: new Date('2026-10-08T12:00:00.000Z'),
			}
		)
		// the action passes the user id: no extra call to the Clerk API
		expect(clerk.currentUser).not.toHaveBeenCalled()
	})

	it('refuses to create a checkout without a user', async () => {
		const consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {})

		await expect(createCheckoutLink('365926', undefined)).rejects.toThrow(
			'User is not authenticated.'
		)
		expect(lemonsqueezy.createCheckout).not.toHaveBeenCalled()
		consoleErrorSpy.mockRestore()
	})

	it('lets a Lemon Squeezy failure reach the caller', async () => {
		lemonsqueezy.createCheckout.mockRejectedValue(
			new Error('Lemon Squeezy Error')
		)

		await expect(createCheckoutLink('365926', 'user_123')).rejects.toThrow(
			'Lemon Squeezy Error'
		)
	})
})
