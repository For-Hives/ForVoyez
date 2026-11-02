// @vitest-environment node
import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'

const appDir = path.resolve(__dirname, '../../../src/app')

// The page file behind a public path, with or without the (dashboard) group
function pageExists(pathname) {
	return ['', '(dashboard)'].some(group => existsSync(path.join(appDir, group, pathname, 'page.js')))
}

describe('sitemap.xml', () => {
	const urls = sitemap().map(entry => new URL(entry.url))

	it('lists the public pages', () => {
		expect(urls.map(url => url.pathname).sort()).toEqual([
			'/',
			'/app/legals/legal-notice',
			'/app/legals/privacy-policy',
			'/app/legals/terms',
			'/contact',
			'/wordpress-plugin',
		])
	})

	it('only lists pages that exist, on the production host', () => {
		for (const url of urls) {
			expect(url.origin).toBe('https://forvoyez.com')
			expect(pageExists(url.pathname), url.pathname).toBe(true)
		}
	})
})

describe('robots.txt', () => {
	const { sitemap: location, rules } = robots()

	it('points to the sitemap', () => {
		expect(location).toBe('https://forvoyez.com/sitemap.xml')
	})

	it('keeps the account pages and the API out, but not the legal pages', () => {
		expect(rules.userAgent).toBe('*')
		expect(rules.disallow).toEqual(expect.arrayContaining(['/app', '/api/', '/profile']))
		expect(rules.allow).toEqual(expect.arrayContaining(['/', '/app/legals/']))
	})
})
