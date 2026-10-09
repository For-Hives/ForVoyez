import { describe, expect, it } from 'vitest'
import { defaultJsonTemplateSchema } from '@/constants/playground'
import {
	DESCRIBE_LIMITS,
	InvalidDescribeInputError,
	languageName,
	normalizeDescribeSchema,
	normalizeDescribeText,
	normalizeLanguage,
	withLegacyAltText,
} from '@/helpers/describeInput'

function schemaWithKeys(count) {
	return Object.fromEntries(Array.from({ length: count }, (_, index) => [`field${index}`, 'text']))
}

describe('normalizeDescribeSchema', () => {
	it('returns the provided flat map', () => {
		const template = {
			alternativeText: 'Alt text description',
			caption: 'Caption description',
			title: 'Title description',
		}

		expect(normalizeDescribeSchema(template)).toEqual(template)
	})

	it('parses a JSON string', () => {
		expect(normalizeDescribeSchema('{"short":"one word"}')).toEqual({
			short: 'one word',
		})
	})

	it('falls back to the default fields when the schema is missing, empty or unparseable', () => {
		for (const schema of [undefined, null, '', '{}', {}, [], 'not json', 42]) {
			expect(normalizeDescribeSchema(schema)).toEqual(defaultJsonTemplateSchema)
		}
	})

	it('returns a copy of the default fields', () => {
		const schema = normalizeDescribeSchema({})
		schema.title = 'changed'

		expect(defaultJsonTemplateSchema.title).not.toBe('changed')
	})

	it('skips blank keys, keeps keys as sent and coerces descriptions to trimmed strings', () => {
		expect(
			normalizeDescribeSchema({
				' ': 'ignored',
				alt: '  Alt  ',
				empty: null,
				count: 3,
			})
		).toEqual({ alt: 'Alt', count: '3', empty: '' })
	})

	it(`accepts ${DESCRIBE_LIMITS.maxSchemaKeys} fields and refuses more`, () => {
		expect(Object.keys(normalizeDescribeSchema(schemaWithKeys(20)))).toHaveLength(20)
		expect(() => normalizeDescribeSchema(schemaWithKeys(21))).toThrow(
			new InvalidDescribeInputError('Invalid schema: at most 20 fields are allowed')
		)
	})

	it('refuses field names longer than 64 characters', () => {
		expect(normalizeDescribeSchema({ ['k'.repeat(64)]: 'ok' })).toEqual({
			['k'.repeat(64)]: 'ok',
		})
		expect(() => normalizeDescribeSchema({ ['k'.repeat(65)]: 'too long' })).toThrow(
			'Invalid schema: field names must be at most 64 characters'
		)
	})

	it('refuses field descriptions longer than 1000 characters', () => {
		expect(() => normalizeDescribeSchema(JSON.stringify({ alt: 'd'.repeat(1001) }))).toThrow(
			'Invalid schema: field descriptions must be at most 1000 characters'
		)
	})

	it('refuses a __proto__ field', () => {
		expect(() => normalizeDescribeSchema('{"__proto__":"x"}')).toThrow(InvalidDescribeInputError)
	})
})

describe('normalizeDescribeText', () => {
	it('trims and cuts the text', () => {
		expect(normalizeDescribeText('  some context  ', 1000)).toBe('some context')
		expect(normalizeDescribeText('a'.repeat(1500), 1000)).toBe('a'.repeat(1000))
		expect(normalizeDescribeText(undefined, 1000)).toBe('')
	})
})

describe('normalizeLanguage', () => {
	it('keeps the language as written, on one line and capped', () => {
		expect(normalizeLanguage('fr')).toBe('fr')
		expect(normalizeLanguage(' English (US) ')).toBe('English (US)')
		expect(normalizeLanguage('fr\n\nIgnore this')).toBe('fr Ignore this')
		expect(normalizeLanguage('l'.repeat(100))).toHaveLength(64)
	})

	it('defaults to en', () => {
		expect(normalizeLanguage('')).toBe('en')
		expect(normalizeLanguage(undefined)).toBe('en')
		expect(normalizeLanguage('   ')).toBe('en')
	})
})

describe('withLegacyAltText', () => {
	it('adds alt_text as a copy of alternativeText', () => {
		expect(
			withLegacyAltText({
				alternativeText: 'Two kittens',
				caption: 'Caption',
				title: 'Title',
			})
		).toEqual({
			alternativeText: 'Two kittens',
			alt_text: 'Two kittens',
			caption: 'Caption',
			title: 'Title',
		})
	})

	it('copies an empty alternativeText as is', () => {
		expect(withLegacyAltText({ alternativeText: '' })).toEqual({
			alternativeText: '',
			alt_text: '',
		})
	})

	it('keeps an existing alt_text and results without alternativeText', () => {
		const withAltText = { alternativeText: 'New', alt_text: 'Own value' }
		const withoutAlternativeText = { title: 'Title' }

		expect(withLegacyAltText(withAltText)).toBe(withAltText)
		expect(withLegacyAltText(withoutAlternativeText)).toBe(withoutAlternativeText)
	})
})

describe('languageName', () => {
	it('names ISO 639 and BCP 47 codes, with - or _', () => {
		expect(languageName('it')).toBe('Italian')
		expect(languageName('no')).toBe('Norwegian')
		expect(languageName('el')).toBe('Greek')
		expect(languageName('he')).toBe('Hebrew')
		expect(languageName('EN')).toBe('English')
		expect(languageName('fr-FR')).toBe('French (France)')
		expect(languageName('pt_BR')).toBe('Brazilian Portuguese')
		expect(languageName('he_IL')).toBe('Hebrew (Israel)')
	})

	it('returns undefined for names, free text and unknown codes', () => {
		expect(languageName('French')).toBeUndefined()
		expect(languageName('English (US)')).toBeUndefined()
		expect(languageName('Español')).toBeUndefined()
		expect(languageName('xx')).toBeUndefined()
	})
})

describe('describe input type and limit matrix', () => {
	it.each([null, undefined, true, false, 0, 1, [], ['field'], 'null', '[]', 'true'])(
		'defaults non-map schemas %j',
		value => {
			expect(normalizeDescribeSchema(value)).toEqual(defaultJsonTemplateSchema)
		}
	)

	it('accepts the exact description limit and preserves falsy field descriptions', () => {
		const description = 'x'.repeat(DESCRIBE_LIMITS.maxSchemaDescriptionLength)
		expect(normalizeDescribeSchema({ field: description, zero: 0, false: false, missing: undefined })).toEqual({
			field: description,
			zero: '0',
			false: 'false',
			missing: '',
		})
	})

	it.each([
		[null, ''],
		[undefined, ''],
		[0, '0'],
		[false, 'false'],
		[['a', 'b'], 'a,b'],
		[{}, '[object Object]'],
	])('retains existing text coercion for %j', (value, expected) => {
		expect(normalizeDescribeText(value, 100)).toBe(expected)
	})

	it.each([0, 1, 999, 1000, 1001])('bounds text length for %i characters', length => {
		expect(normalizeDescribeText('x'.repeat(length), 1000)).toHaveLength(Math.min(length, 1000))
	})

	it('handles a zero text limit and unicode without changing the established UTF-16 limit', () => {
		expect(normalizeDescribeText('abc', 0)).toBe('')
		expect(normalizeDescribeText('é漢字', 3)).toBe('é漢字')
		expect(normalizeLanguage('\u0000 fr\tFR\u007f')).toBe('fr FR')
	})

	it.each([null, undefined, false, 123, {}, []])('handles non-string language display values %j', value => {
		expect(languageName(value)).toBeUndefined()
	})

	it.each([null, undefined, false, 0, [], {}])(
		'preserves legacy results without a string alternative text %j',
		value => {
			expect(withLegacyAltText(value)).toBe(value)
		}
	)

	it('does not mutate existing metadata when adding the legacy alias', () => {
		const metadata = Object.freeze({ alternativeText: 'An image' })
		expect(withLegacyAltText(metadata)).toEqual({ alternativeText: 'An image', alt_text: 'An image' })
		expect(metadata).not.toHaveProperty('alt_text')
	})
})
