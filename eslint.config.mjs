import reactHooksPlugin from 'eslint-plugin-react-hooks'

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import noOnlyTestsPlugin from 'eslint-plugin-no-only-tests'
import queryPlugin from '@tanstack/eslint-plugin-query'
import perfectionist from 'eslint-plugin-perfectionist'
import nextPlugin from '@next/eslint-plugin-next'
import promisePlugin from 'eslint-plugin-promise'
import wokePlugin from 'eslint-plugin-woke' // import tsParser from '@typescript-eslint/parser'
import * as espree from 'espree'

export default [
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
						'type',
						'react',
						'nanostores',
						['builtin', 'external'],
						'internal-type',
						'internal',
						['parent-type', 'sibling-type', 'index-type'],
						['parent', 'sibling', 'index'],
						'side-effect',
						'style',
						'object',
						'unknown',
					],
					// Correction ici (customGroups au lieu de custom-groups)
					customGroups: {
						value: {
							nanostores: '@nanostores/.*',
							react: ['react', 'react-*'],
						},
						type: {
							react: 'react',
						},
					},
					// Correction ici (internalPattern au lieu de internal-pattern)
					internalPattern: [
						'@/components/.*',
						'@/services/.*',
						'@/constants/.*',
						'@/helpers/.*',
						'@/app/actions.*',
					],
					newlinesBetween: 'always',
					type: 'line-length',
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
		languageOptions: {
			parserOptions: {
				ecmaFeatures: { jsx: true },
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			parser: espree,
		},
		plugins: {
			'no-only-tests': noOnlyTestsPlugin,
			'react-hooks': reactHooksPlugin,
			'@next/next': nextPlugin,
			woke: wokePlugin,
		},
		files: ['**/*.{js,jsx,mjs,cjs}'],
	},
]
