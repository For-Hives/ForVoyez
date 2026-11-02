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
			'/app/legals',
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

	// How crawlers read the rules: the longest matching path wins, Allow on a tie.
	function isAllowed(pathname) {
		const longest = paths => Math.max(-1, ...paths.filter(path => pathname.startsWith(path)).map(path => path.length))
		return longest(rules.allow) >= longest(rules.disallow)
	}

	it('applies to every crawler', () => {
		expect(rules.userAgent).toBe('*')
	})

	it.each(['/app/tokens', '/app/usage', '/api/describe', '/profile'])('keeps %s out', pathname => {
		expect(isAllowed(pathname)).toBe(false)
	})

	// '/app' without its slash would also match /apple-icon.png
	it.each(['/apple-icon.png', '/apple-touch-icon.png', '/app/legals', '/contact'])('lets %s in', pathname => {
		expect(isAllowed(pathname)).toBe(true)
	})

	it('lets every page of the sitemap in', () => {
		for (const { url } of sitemap()) {
			expect(isAllowed(new URL(url).pathname), url).toBe(true)
		}
	})
})
