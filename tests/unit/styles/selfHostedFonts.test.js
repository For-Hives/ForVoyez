// The fonts are served from public/fonts so that `next build` never downloads
// them: next/font/google fetched them from Google Fonts on every build, and
// that request failed at random (CI and deployments).
// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import nextConfig from '../../../next.config.js'

const root = path.join(import.meta.dirname, '..', '..', '..')
const fontsDir = path.join(root, 'public', 'fonts')
const css = readFileSync(path.join(root, 'src', 'styles', 'fonts.css'), 'utf8')
const layout = readFileSync(path.join(root, 'src', 'app', 'layout.js'), 'utf8')

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
