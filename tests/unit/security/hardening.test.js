// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { describe, expect, it } from 'vitest'
import { createRequire } from 'module'
import path from 'path'

const root = path.resolve(__dirname, '../../..')
const read = file => readFileSync(path.join(root, file), 'utf8')

function listFiles(directory) {
	return readdirSync(directory).flatMap(entry => {
		const full = path.join(directory, entry)
		return statSync(full).isDirectory() ? listFiles(full) : [full]
	})
}

const SERVER_ONLY_SERVICES = [
	'src/services/database.service.js',
	'src/services/lemonsqueezy.service.js',
]

describe('server-only data services', () => {
	it.each(SERVER_ONLY_SERVICES)(
		'%s is server-only, not a server action module',
		file => {
			const source = read(file)
			// a file-wide 'use server' turns every export (updateCredits,
			// syncPlans...) into an action callable from any browser
			expect(source).not.toMatch(/^\s*['"]use server['"]/m)
			expect(source).toMatch(/^import 'server-only'$/m)
		}
	)

	it('no client component imports them directly', () => {
		const offenders = listFiles(path.join(root, 'src'))
			.filter(file => file.endsWith('.js'))
			.filter(file => /^\s*['"]use client['"]/.test(readFileSync(file, 'utf8')))
			.filter(file =>
				/@\/services\/(database|lemonsqueezy)\.service/.test(
					readFileSync(file, 'utf8')
				)
			)
			.map(file => path.relative(root, file))

		expect(offenders).toEqual([])
	})
})

describe('leftovers and secrets', () => {
	it('the debug /api/hello route is gone', () => {
		expect(existsSync(path.join(root, 'src/app/api/hello'))).toBe(false)
	})

	it('no Bruno request embeds a literal JWT (use {{token}})', () => {
		const jwtLiteral = /eyJ[\w-]+\.[\w-]+\.[\w-]+/
		const bruFiles = listFiles(path.join(root, 'bruno')).filter(file =>
			file.endsWith('.bru')
		)

		expect(bruFiles.length).toBeGreaterThan(0)
		for (const file of bruFiles) {
			expect(readFileSync(file, 'utf8')).not.toMatch(jwtLiteral)
		}
		expect(read('bruno/token.bru')).toContain('token: {{token}}')
	})
})

describe('next.config.js upload limits', () => {
	const require = createRequire(import.meta.url)
	const nextConfig = require(path.join(root, 'next.config.js'))
	const toBytes = size => {
		const [, value, unit] = /^(\d+(?:\.\d+)?)\s*(kb|mb)$/i.exec(size)
		return Number(value) * 1024 ** (unit.toLowerCase() === 'mb' ? 2 : 1)
	}
	// the playground accepts 10 MB images, sent with a multipart framing and a
	// small JSON `data` field
	const tenMegabyteImageRequest = 10 * 1024 * 1024 + 64 * 1024

	it('lets a 10 MB playground image through the server action body limit', () => {
		expect(
			toBytes(nextConfig.experimental.serverActions.bodySizeLimit)
		).toBeGreaterThanOrEqual(tenMegabyteImageRequest)
	})

	it('lets the proxy buffer the whole request (it truncates beyond its limit)', () => {
		expect(
			toBytes(nextConfig.experimental.proxyClientMaxBodySize)
		).toBeGreaterThanOrEqual(tenMegabyteImageRequest)
	})
})
