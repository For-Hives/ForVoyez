import { z } from 'zod'
import { MAX_TOKEN_NAME_LENGTH } from '@/constants/tokens'

// The dashboard suggests 10 years. A key cannot be rotated, only deleted: this
// keeps a date such as the year 9999 out.
const MAX_TOKEN_LIFETIME_MS = 20 * 365 * 24 * 60 * 60 * 1000

const dateInput = z.union([z.date(), z.iso.datetime({ offset: true })])
const tokenInput = z.object({
	name: z
		.string()
		.max(MAX_TOKEN_NAME_LENGTH)
		.refine(value => value.trim().length > 0, 'Name is required'),
	createdAt: dateInput,
	expiredAt: dateInput
		.refine(value => new Date(value).getTime() > Date.now(), 'Expiration date must be in the future')
		.refine(
			value => new Date(value).getTime() <= Date.now() + MAX_TOKEN_LIFETIME_MS,
			'Expiration date is too far away'
		),
})

// Server Actions can be invoked directly, bypassing the browser form's Yup validation.
export function parseTokenInput(value) {
	const result = tokenInput.safeParse(value)
	if (!result.success) throw new Error('Invalid token input')
	return result.data
}

export function requireTokenId(value) {
	if (typeof value !== 'string' || value.trim().length === 0) throw new Error('Invalid token id')
	return value
}
