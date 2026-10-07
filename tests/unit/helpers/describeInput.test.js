import { describe, expect, it } from 'vitest'

import {
	DESCRIBE_LIMITS,
	InvalidDescribeInputError,
	normalizeDescribeSchema,
	normalizeDescribeText,
	normalizeLanguage,
} from '@/helpers/describeInput'
import { defaultJsonTemplateSchema } from '@/constants/playground'

function schemaWithKeys(count) {
	return Object.fromEntries(
		Array.from({ length: count }, (_, index) => [`field${index}`, 'text'])
	)
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
		expect(
			Object.keys(normalizeDescribeSchema(schemaWithKeys(20)))
		).toHaveLength(20)
		expect(() => normalizeDescribeSchema(schemaWithKeys(21))).toThrow(
			new InvalidDescribeInputError(
				'Invalid schema: at most 20 fields are allowed'
			)
		)
	})

	it('refuses field names longer than 64 characters', () => {
		expect(normalizeDescribeSchema({ ['k'.repeat(64)]: 'ok' })).toEqual({
			['k'.repeat(64)]: 'ok',
		})
		expect(() =>
			normalizeDescribeSchema({ ['k'.repeat(65)]: 'too long' })
		).toThrow('Invalid schema: field names must be at most 64 characters')
	})

	it('refuses field descriptions longer than 1000 characters', () => {
		expect(() =>
			normalizeDescribeSchema(JSON.stringify({ alt: 'd'.repeat(1001) }))
		).toThrow(
			'Invalid schema: field descriptions must be at most 1000 characters'
		)
	})

	it('refuses a __proto__ field', () => {
		expect(() => normalizeDescribeSchema('{"__proto__":"x"}')).toThrow(
			InvalidDescribeInputError
		)
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
