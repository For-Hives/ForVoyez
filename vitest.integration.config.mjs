import config from './vitest.config.mjs'

export default {
	...config,
	test: {
		...config.test,
		include: ['tests/integration/**/*.test.js'],
		environment: 'node',
	},
}
