import react from '@vitejs/plugin-react'

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
	resolve: {
		alias: {
			// During unit tests we don't need the real Clerk package; point imports
			// to local lightweight mocks so Vitest / Vite can resolve them.
			'@clerk/nextjs/server': path.resolve(
				__dirname,
				'./tests/unit/mocks/clerk.server.js'
			),
			'@clerk/nextjs': path.resolve(
				__dirname,
				'./tests/unit/mocks/clerk.client.js'
			),
			'@': path.resolve(__dirname, './src'),
		},
	},
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
		include: ['tests/unit/**/*.test.js'],
		environment: 'jsdom',
	},
	plugins: [react()],
})
