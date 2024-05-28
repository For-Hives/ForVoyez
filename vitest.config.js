import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
	test: {
		coverage: {
			reporter: [
				'text',
				'json-summary',
				'json',
				'clover',
				'cobertura',
				'html',
				'html-spa',
				'lcov',
			],
			provider: 'v8',
		},
		environment: 'jsdom',
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	plugins: [react()],
})
