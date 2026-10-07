import reactHooksPlugin from 'eslint-plugin-react-hooks'

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import noOnlyTestsPlugin from 'eslint-plugin-no-only-tests'
import queryPlugin from '@tanstack/eslint-plugin-query'
import perfectionist from 'eslint-plugin-perfectionist'
import nextPlugin from '@next/eslint-plugin-next'
import promisePlugin from 'eslint-plugin-promise'
import { fixupPluginRules } from '@eslint/compat'
import wokePlugin from 'eslint-plugin-woke' // import tsParser from '@typescript-eslint/parser'
import * as espree from 'espree'

export default [
	{
		ignores: [
			'.next/',
			'coverage/',
			'test-results/',
			'playwright-report/',
			'src/generated/',
		],
	},
	perfectionist.configs['recommended-natural'],
	eslintPluginPrettierRecommended,
	...queryPlugin.configs['flat/recommended'],
	promisePlugin.configs['flat/recommended'],
	{
		rules: {
			'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
			'no-only-tests/no-only-tests': 'error',
			'react-hooks/exhaustive-deps': 'off',

			'@next/next/no-img-element': 'off',
			'prettier/prettier': 'error',
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs['core-web-vitals'].rules,

			'perfectionist/sort-imports': [
				'error',
				{
					groups: [
						'type-import',
						'react',
						'nanostores',
						['value-builtin', 'value-external'],
						'type-internal',
						'value-internal',
						['type-parent', 'type-sibling', 'type-index'],
						['value-parent', 'value-sibling', 'value-index'],
						'side-effect',
						'style',
						'ts-equals-import',
						'unknown',
					],
					customGroups: [
						{
							elementNamePattern: ['react', 'react-*'],
							groupName: 'react',
						},
						{
							elementNamePattern: '@nanostores/.*',
							groupName: 'nanostores',
						},
					],
					internalPattern: [
						'@/components/.*',
						'@/services/.*',
						'@/constants/.*',
						'@/helpers/.*',
						'@/app/actions.*',
					],
					type: 'line-length',
					newlinesBetween: 1,
					order: 'desc',
				},
			],
			'perfectionist/sort-objects': [
				'warn',
				{
					type: 'line-length',
					order: 'desc',
				},
			],
			'perfectionist/sort-enums': [
				'error',
				{
					type: 'line-length',
					order: 'desc',
				},
			],

			'promise/always-return': 'off',

			'woke/all': 'warn',
		},
		plugins: {
			'no-only-tests': noOnlyTestsPlugin,
			// eslint-plugin-woke still calls context.getSourceCode(), removed in ESLint 10
			woke: fixupPluginRules(wokePlugin),
			'react-hooks': reactHooksPlugin,
			'@next/next': nextPlugin,
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: { jsx: true },
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			parser: espree,
		},
		files: ['**/*.{js,jsx,mjs,cjs}'],
	},
]
