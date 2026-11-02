import { createConcurrencyGate, createInFlightLimiter } from '@/helpers/rateLimit'

// Requests of one user at the same time, API and playground together. Well above
// what the WordPress plugin sends: it analyses one image after another.
export const MAX_DESCRIBES_AT_ONCE = 16
export const TOO_MANY_AT_ONCE = `Too many requests at the same time: at most ${MAX_DESCRIBES_AT_ONCE} per account, wait for one to end and try again`

// In globalThis because the limits hold for the process: the API route and the
// server action can be bundled with their own copy of this module.
globalThis.forvoyezDescribeLimits ??= {
	describes: createInFlightLimiter(MAX_DESCRIBES_AT_ONCE),
	heavyDecodes: createConcurrencyGate(1),
}
const limits = globalThis.forvoyezDescribeLimits

/**
 * @param {string} userId - Clerk user id
 * @returns {(() => void) | null} the function to call when the request ends, null over the limit
 */
export function acquireDescribeSlot(userId) {
	return limits.describes(userId)
}

/**
 * Runs a decode that takes hundreds of MB, one at a time: several at once add up.
 * @param {() => Promise<T>} decode
 * @returns {Promise<T>}
 * @template T
 */
export function withHeavyDecodeSlot(decode) {
	return limits.heavyDecodes(decode)
}
