import { defaultJsonTemplateSchema } from '@/constants/playground'

// Limits on the describe inputs (public API and playground). Context and
// keywords are customer text sent to the model: longer values are cut. A
// schema beyond these limits is rejected with a 400.
export const DESCRIBE_LIMITS = {
	maxSchemaDescriptionLength: 1000,
	maxKeywordsLength: 1000,
	maxContextLength: 1000,
	maxSchemaKeyLength: 64,
	maxLanguageLength: 64,
	maxSchemaKeys: 20,
}

// A describe request the API answers with 400 (the message is shown to the
// customer, e.g. by the WordPress plugin).
export class InvalidDescribeInputError extends Error {
	constructor(message) {
		super(message)
		this.name = 'InvalidDescribeInputError'
	}
}

// The schema asks for a longer answer than one generation may return (its
// output token cap, about 1,500 English words for all fields together). Only
// known once the model stops at the cap; the credit is refunded.
export class DescriptionTooLongError extends InvalidDescribeInputError {
	constructor() {
		super(
			'Invalid schema: the requested fields need a longer answer than the API can return (about 1,500 words for all fields together), ask for fewer or shorter fields'
		)
		this.name = 'DescriptionTooLongError'
	}
}

/**
 * Normalizes the `schema` field: a flat map `key -> description`, as an object
 * or a JSON string. Missing, empty or unparseable schemas fall back to the
 * default fields (title, alternativeText, caption). Keys are kept as sent,
 * blank keys are skipped and descriptions are coerced to trimmed strings.
 * @param {string|object} schema
 * @returns {Record<string, string>}
 * @throws {InvalidDescribeInputError} when the schema exceeds DESCRIBE_LIMITS
 */
export function normalizeDescribeSchema(schema) {
	let parsed = schema
	if (typeof schema === 'string') {
		try {
			parsed = JSON.parse(schema)
		} catch {
			parsed = {}
		}
	}

	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		parsed = {}
	}

	const entries = Object.entries(parsed)
		.filter(([key]) => key.trim().length > 0)
		.map(([key, value]) => [key, String(value ?? '').trim()])

	if (entries.length === 0) {
		return { ...defaultJsonTemplateSchema }
	}

	if (entries.length > DESCRIBE_LIMITS.maxSchemaKeys) {
		throw new InvalidDescribeInputError(
			`Invalid schema: at most ${DESCRIBE_LIMITS.maxSchemaKeys} fields are allowed`
		)
	}

	for (const [key, description] of entries) {
		if (key.length > DESCRIBE_LIMITS.maxSchemaKeyLength) {
			throw new InvalidDescribeInputError(
				`Invalid schema: field names must be at most ${DESCRIBE_LIMITS.maxSchemaKeyLength} characters`
			)
		}
		if (key === '__proto__') {
			throw new InvalidDescribeInputError(
				'Invalid schema: "__proto__" is not allowed as a field name'
			)
		}
		if (description.length > DESCRIBE_LIMITS.maxSchemaDescriptionLength) {
			throw new InvalidDescribeInputError(
				`Invalid schema: field descriptions must be at most ${DESCRIBE_LIMITS.maxSchemaDescriptionLength} characters`
			)
		}
	}

	return Object.fromEntries(entries)
}

/**
 * Trims customer text (context, keywords) and cuts it to `maxLength`.
 * @param {unknown} value
 * @param {number} maxLength
 * @returns {string}
 */
export function normalizeDescribeText(value, maxLength) {
	return String(value ?? '')
		.trim()
		.slice(0, maxLength)
		.trim()
}

/**
 * The output language as written by the customer ("en", "fr-FR", "French"),
 * on one line and at most DESCRIBE_LIMITS.maxLanguageLength characters.
 * Defaults to "en".
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeLanguage(value) {
	const language = String(value ?? '')
		.replace(/[\u0000-\u001f\u007f\s]+/g, ' ')
		.trim()
		.slice(0, DESCRIBE_LIMITS.maxLanguageLength)
		.trim()

	return language || 'en'
}

const languageNames = new Intl.DisplayNames(['en'], {
	fallback: 'none',
	type: 'language',
})

/**
 * The English name of a language code, ISO 639 or BCP 47, with `-` or `_`:
 * "it" → "Italian", "he_IL" → "Hebrew (Israel)". Undefined when the value is
 * not a known code, e.g. a name ("French") or free text ("English (US)").
 * The model reads a bare code such as "it", "no" or "el" as an English or
 * Spanish word, and then answers in the wrong language.
 * @param {string} language - output of normalizeLanguage
 * @returns {string | undefined}
 */
export function languageName(language) {
	try {
		return languageNames.of(language.replace(/_/g, '-'))
	} catch {
		// RangeError: not a well-formed language tag
		return undefined
	}
}

/**
 * Adds `alt_text`, a copy of `alternativeText`, to a describe result. The
 * WordPress plugin up to 1.1.40 sends no `schema` and reads `alt_text`:
 * without it, each analysis saved an empty alt text over the existing one.
 * The describe route only calls this when the request has no `schema` field.
 * @param {Record<string, string>} metadata
 * @returns {Record<string, string>}
 */
export function withLegacyAltText(metadata) {
	if (
		typeof metadata?.alternativeText !== 'string' ||
		Object.hasOwn(metadata, 'alt_text')
	) {
		return metadata
	}

	return { ...metadata, alt_text: metadata.alternativeText }
}
