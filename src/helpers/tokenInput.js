import { z } from 'zod'

const dateInput = z.union([z.date(), z.iso.datetime({ offset: true })])
const tokenInput = z.object({
	name: z.string().refine(value => value.trim().length > 0, 'Name is required'),
	createdAt: dateInput,
	expiredAt: dateInput.refine(value => new Date(value).getTime() > Date.now(), 'Expiration date must be in the future'),
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
