// The fonts are served from public/fonts so that `next build` never downloads
// them: next/font/google fetched them from Google Fonts on every build, and
// that request failed at random (CI and deployments).
// @vitest-environment node
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import nextConfig from '../../../next.config.js'

const root = path.join(import.meta.dirname, '..', '..', '..')
const fontsDir = path.join(root, 'public', 'fonts')
const css = readFileSync(path.join(root, 'src', 'styles', 'fonts.css'), 'utf8')
const layout = readFileSync(path.join(root, 'src', 'app', 'layout.js'), 'utf8')

// The files are cached for a year under their name: new bytes need a new name.
const FONT_FILES = {
	'jost-v20-cyrillic-normal.woff2': '184c3af415cddd52af31cf70166bf351adb70b09e64fdb1948109192a26c2c0d',
	'jost-v20-latin-ext-normal.woff2': 'b2a539cd1f2bbf123e66bafa988bbd32249a7ba3335aec377a9fc1b37734b1ed',
	'jost-v20-latin-normal.woff2': '235d8f8964bfdf105fc0c3e4c77b5e70f31bee1dad611d59318b5f2a5cb64d90',
	'source-sans-3-v20-cyrillic-ext-italic.woff2': 'a75df0733bf488f29b3a66798176c10b6101c76d575e1b3050e1bc4538ae043c',
	'source-sans-3-v20-cyrillic-ext-normal.woff2': '7e462c0c0b6acdc316f1a352d711603def5a6099f2867efed8164de090ba5334',
	'source-sans-3-v20-cyrillic-italic.woff2': 'aa6d16964ec15f361cf1edf8a3ece88ca18eb005bf0643b9e2d125213dcda705',
	'source-sans-3-v20-cyrillic-normal.woff2': '44aa5fb37c5aa2a2b44ceab9c077b42de47d50d47c0dcbefa2555082c38df8dd',
	'source-sans-3-v20-greek-ext-italic.woff2': '4653fad1ffff5e3ec7260089cfd3319b1b636f636873be6d3a6b66c2679260f9',
	'source-sans-3-v20-greek-ext-normal.woff2': '1877869fdda03e63208ad1b3aeb64965d31f9065a4c1ecc406b582b8eacd326f',
	'source-sans-3-v20-greek-italic.woff2': 'e3a57596b534218c547e86f3e6ea4a084ce46edc96deee173a191df881ad1b18',
	'source-sans-3-v20-greek-normal.woff2': '2c02dd66c736fa488f4826307e649ab2f09dff816d16a3a1a767a5cdb3535c24',
	'source-sans-3-v20-latin-ext-italic.woff2': 'daff22b9d8482f797b1ffb84f253cad6f7d61ca35afa7a46bba0884ee9e31998',
	'source-sans-3-v20-latin-ext-normal.woff2': 'ed3571ea9ff752f1c846f1c9ad2b0006de42f478a2db9163a74db0729a4eb281',
	'source-sans-3-v20-latin-italic.woff2': 'bf6aa2f7b9a411fe5f7e489ad2b54b69594ccb656f54b3abacca2b69a945384d',
	'source-sans-3-v20-latin-normal.woff2': '587435ca9d90732b8c1ce4958222c6ad3ade2b875500188e1d318efbcb61f4c5',
	'source-sans-3-v20-vietnamese-italic.woff2': '1bb24cb41e1df8440b5da7751f4c8ec251ad49f64e611dcc784e7a697d8d9c61',
	'source-sans-3-v20-vietnamese-normal.woff2': '091552f93da32a46cebd62b9ab8d4c739447ebcebc81faa05e636a7dc790cb60',
}

const faces = [...css.matchAll(/@font-face \{([^}]*)\}/g)]
	.map(match => match[1])
	.filter(body => body.includes('unicode-range'))
	.map(body => ({
		family: body.match(/font-family: "([^"]+)"/)?.[1],
		display: body.match(/font-display: (\w+)/)?.[1],
		weight: body.match(/font-weight: (\d+)/)?.[1],
		style: body.match(/font-style: (\w+)/)?.[1],
		file: body.match(/url\("\/fonts\/([^"]+)"\)/)?.[1],
	}))

function sourceFiles(directory) {
	return readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter(entry => entry.isFile() && /\.(js|jsx|mjs|ts|tsx|css)$/.test(entry.name))
		.map(entry => path.join(entry.parentPath, entry.name))
}

describe('self-hosted fonts', () => {
	it('never asks Google Fonts for a font', () => {
		const offenders = sourceFiles(path.join(root, 'src')).filter(file =>
			/next\/font\/google|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(
				readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
			)
		)

		expect(offenders).toEqual([])
	})

	it('declares the weights and styles the site was built with, for every subset', () => {
		const variants = family =>
			[...new Set(faces.filter(face => face.family === family).map(face => `${face.style} ${face.weight}`))].sort()

		expect(variants('Source Sans 3')).toEqual([
			'italic 300',
			'italic 400',
			'italic 700',
			'italic 900',
			'normal 300',
			'normal 400',
			'normal 700',
			'normal 900',
		])
		expect(variants('Jost')).toEqual([
			'normal 200',
			'normal 300',
			'normal 400',
			'normal 500',
			'normal 600',
			'normal 700',
			'normal 800',
		])
		// 7 subsets of Source Sans 3 in 8 variants, 3 subsets of Jost in 7
		expect(faces).toHaveLength(7 * 8 + 3 * 7)
		expect(faces.every(face => face.display === 'swap')).toBe(true)
	})

	it('ships every font file the stylesheet names, and no other', () => {
		const named = [...new Set(faces.map(face => face.file))].sort()
		const shipped = readdirSync(fontsDir)
			.filter(file => file.endsWith('.woff2'))
			.sort()

		expect(named).toHaveLength(17)
		expect(shipped).toEqual(named)
		expect(shipped).toEqual(Object.keys(FONT_FILES).sort())
	})

	it('keeps the bytes behind each file name', () => {
		const digests = Object.fromEntries(
			Object.keys(FONT_FILES).map(file => [
				file,
				createHash('sha256')
					.update(readFileSync(path.join(fontsDir, file)))
					.digest('hex'),
			])
		)

		expect(digests).toEqual(FONT_FILES)
	})

	// family, style, weight, display, file and unicode-range of the 77 rules, in
	// order: the rules Google Fonts serves. A subset with the wrong range would
	// load for the wrong characters, or never.
	it('keeps every @font-face rule as Google Fonts serves it', () => {
		const rules = [...css.matchAll(/@font-face \{([^}]*)\}/g)]
			.map(match => match[1])
			.filter(body => body.includes('unicode-range'))
			.map(body =>
				[
					body.match(/font-family: "([^"]+)"/)[1],
					body.match(/font-style: (\w+)/)[1],
					body.match(/font-weight: (\d+)/)[1],
					body.match(/font-display: (\w+)/)[1],
					body.match(/url\("\/fonts\/([^"]+)"\)/)[1],
					body.match(/unicode-range:\s*([^;]+);/)[1].replace(/\s+/g, ''),
				].join('|')
			)

		expect(rules).toHaveLength(77)
		expect(createHash('sha256').update(rules.join('\n')).digest('hex')).toBe(
			'ad462fbb620b66a2d178defa9f89af15c662f5891a43b93a51059228cbb9a3b5'
		)
	})

	it('ships the licence of both fonts next to the files', () => {
		for (const licence of ['OFL-source-sans-3.txt', 'OFL-jost.txt']) {
			expect(readFileSync(path.join(fontsDir, licence), 'utf8')).toContain('SIL Open Font License')
		}
	})

	it('sets the two font variables the styles use, with a resized Arial while the font loads', () => {
		expect(css).toMatch(/--font-sourcesans: "Source Sans 3", "Source Sans 3 Fallback";/)
		expect(css).toMatch(/--font-jost: "Jost", "Jost Fallback";/)
		expect(css.match(/src: local\(Arial\);/g)).toHaveLength(2)
	})

	it('preloads the latin file of each font, like next/font did', () => {
		const preloaded = [...layout.matchAll(/'(\/fonts\/[^']+\.woff2)'/g)].map(match => match[1])

		expect(preloaded.sort()).toEqual([
			'/fonts/jost-v20-latin-normal.woff2',
			'/fonts/source-sans-3-v20-latin-italic.woff2',
			'/fonts/source-sans-3-v20-latin-normal.woff2',
		])
		for (const href of preloaded) {
			expect(existsSync(path.join(root, 'public', href))).toBe(true)
		}
		expect(layout).toMatch(/preload\(href, \{ as: 'font', type: 'font\/woff2', crossOrigin: 'anonymous' \}\)/)
	})

	it('lets browsers keep the versioned font files for a year', async () => {
		const rules = await nextConfig.headers()
		const fonts = rules.find(rule => rule.source.startsWith('/fonts/'))

		expect(fonts.source).toBe('/fonts/:file*.woff2')
		expect(fonts.headers).toEqual([{ value: 'public, max-age=31536000, immutable', key: 'Cache-Control' }])
		// a new font version needs a new file name: the old one stays cached
		expect(faces.every(face => /-v\d+-/.test(face.file))).toBe(true)
	})
})
