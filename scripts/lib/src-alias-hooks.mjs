// Node module customization hooks for scripts that import the app's code:
// resolve the `@/…` alias (jsconfig.json paths) to src/ and load the src/
// `.js` files as ES modules (package.json has no "type").
// Registered with `register('./lib/src-alias-hooks.mjs', import.meta.url)`.
const SRC = new URL('../../src/', import.meta.url)

export async function resolve(specifier, context, nextResolve) {
	if (specifier.startsWith('@/')) {
		const file = specifier.slice(2)
		const withExtension = /\.[cm]?js$/.test(file) ? file : `${file}.js`
		return nextResolve(new URL(withExtension, SRC).href, context)
	}
	return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
	if (url.startsWith(SRC.href) && url.endsWith('.js')) {
		return nextLoad(url, { ...context, format: 'module' })
	}
	return nextLoad(url, context)
}
