import { cleanup, render, screen, within } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Home from '@/app/page'
import { DevelopersComponent } from '@/components/Landing/Developers/Developers.component'
import { DEVELOPERS_SAMPLE_REQUEST, getDevelopersSampleCode } from '@/components/Landing/Developers/DevelopersSample'
import { getPreviewCode } from '@/components/Playground/GetPreviewCode'
import { DESCRIBE_LIMITS, normalizeDescribeSchema, normalizeLanguage } from '@/helpers/describeInput'

// The page test only looks at the order of the sections: every other section
// is a marker, the developers section is the real one.
vi.mock('@/components/Navbar.component', () => ({ NavbarComponent: () => null }))
vi.mock('@/components/Footer.component', () => ({ FooterComponent: () => null }))
vi.mock('@/components/Landing/Hero/Hero.component', () => ({
	HeroComponent: () => createElement('div', { 'data-section': 'hero' }),
}))
vi.mock('@/components/Landing/Features/Feature.component', () => ({
	FeatureComponent: () => createElement('div', { 'data-section': 'features' }),
}))
vi.mock('@/components/Landing/Plugin/Plugin.component', () => ({
	PluginComponent: () => createElement('div', { 'data-section': 'plugin' }),
}))
vi.mock('@/components/Landing/Pricing/Pricing.component', () => ({
	PricingComponent: () => createElement('div', { 'data-section': 'pricing' }),
}))
vi.mock('@/components/Landing/Cta/Cta.component', () => ({
	CtaComponent: () => createElement('div', { 'data-section': 'cta' }),
}))

// What the service does not do: it writes the texts from the image, it never
// rewrites an alt text that exists, the plugin has no multilingual-plugin
// integration, and nothing machine-readable (OpenAPI, llms.txt, MCP, SDK) is
// published. The pricing words are the ones removed from the plans in 2026-10.
const FORBIDDEN_CLAIMS = [
	/translat/i,
	/translat(e|ion) (your|existing)/i,
	/WPML/i,
	/Polylang/i,
	/WooCommerce/i,
	/unlimited/i,
	/1080p/i,
	/\b4K\b/i,
	/detects? (the|your) (site|language)/i,
	/OpenAPI|llms\.txt|\bMCP\b|\bSDK\b/i,
	/\bfree (trial|credits?)\b/i,
	/real[- ]time|instant/i,
]

const CTAS = [
	{ testId: 'developers-plugin-link', name: 'See the WordPress plugin', href: '/wordpress-plugin', target: 'plugin' },
	{ testId: 'developers-docs-link', name: 'Read the API docs', href: 'https://doc.forvoyez.com/', target: 'docs' },
	{ testId: 'developers-api-key-link', name: 'Get your API key', href: '/app/tokens', target: 'api-key' },
]

function renderSection() {
	const { container } = render(createElement(DevelopersComponent))
	return container
}

function pointNames(card) {
	return within(card)
		.getAllByRole('term')
		.map(term => term.textContent)
}

describe('Landing developers section', () => {
	afterEach(cleanup)

	it('is an anchor target named by its heading', () => {
		renderSection()

		const section = screen.getByTestId('developers-section')
		expect(section.id).toBe('developers')
		expect(screen.getByRole('region', { name: 'Plugin and API' })).toBe(section)
		expect(screen.getByTestId('developers-title').textContent).toBe('One alt text engine. Two ways to use it.')
		// one h1 per page (the hero): the section only adds an h2 and two h3
		expect(section.querySelector('h1')).toBeNull()
		expect(section.querySelectorAll('h2')).toHaveLength(1)
	})

	it('has a WordPress column and an API column with three points each', () => {
		renderSection()

		const wordpress = screen.getByTestId('developers-wordpress')
		expect(within(wordpress).getByRole('heading', { level: 3 }).textContent).toBe('AI-ready for WordPress')
		expect(pointNames(wordpress)).toEqual([
			'Up and running without code',
			"Written in your site's language",
			'Existing images and new uploads',
		])

		const api = screen.getByTestId('developers-api')
		expect(within(api).getByRole('heading', { level: 3 }).textContent).toBe('Developer API')
		expect(pointNames(api)).toEqual(['One endpoint', 'The language you ask for', 'Your own JSON fields'])
	})

	it('links to the plugin page, the API docs and the API keys', () => {
		renderSection()

		const section = screen.getByTestId('developers-section')
		const links = within(section).getAllByRole('link')
		expect(links.map(link => link.getAttribute('data-testid'))).toEqual(CTAS.map(cta => cta.testId))
		for (const cta of CTAS) {
			const link = within(section).getByRole('link', { name: cta.name })
			expect(link.getAttribute('data-testid')).toBe(cta.testId)
			expect(link.getAttribute('href')).toBe(cta.href)
		}
	})

	it('tracks its links with our own attributes, never with the Umami ones', () => {
		const container = renderSection()

		for (const cta of CTAS) {
			const link = screen.getByTestId(cta.testId)
			expect(link.getAttribute('data-fv-event')).toBe('developers-cta-click')
			expect(link.getAttribute('data-fv-event-target')).toBe(cta.target)
			// only static, non-personal properties
			const properties = link.getAttributeNames().filter(name => name.startsWith('data-fv-event-'))
			expect(properties).toEqual(['data-fv-event-target'])
		}
		// Umami's attribute on a link cancels the next/link client navigation
		const umamiAttributes = [...container.querySelectorAll('*')].flatMap(element =>
			element.getAttributeNames().filter(name => name.startsWith('data-umami'))
		)
		expect(umamiAttributes).toEqual([])
		expect('developers-cta-click').toMatch(/^[a-z]+(-[a-z]+)*$/)
		expect('developers-cta-click'.length).toBeLessThanOrEqual(50)
	})

	it('shows the cURL request of the playground generator: image, language and schema', () => {
		renderSection()

		const code = screen.getByTestId('developers-code-sample').textContent.trimEnd()
		expect(code).toBe(getPreviewCode('cURL', DEVELOPERS_SAMPLE_REQUEST))
		expect(code).toBe(getDevelopersSampleCode())
		expect(code.split('\n')).toEqual([
			"curl -X POST 'https://forvoyez.com/api/describe' \\",
			"  -H 'Authorization: Bearer YOUR_API_KEY' \\",
			`  -F 'image=@"/path/to/image.jpg";type=image/jpeg' \\`,
			"  --form-string 'language=fr' \\",
			`  --form-string 'schema={"alt":"Short alt text","caption":"One-line caption"}'`,
		])
	})

	it('sends a schema and a language the API accepts as they are', () => {
		const schema = JSON.parse(DEVELOPERS_SAMPLE_REQUEST.jsonSchema)

		expect(normalizeDescribeSchema(DEVELOPERS_SAMPLE_REQUEST.jsonSchema)).toEqual(schema)
		expect(Object.keys(schema).length).toBeLessThanOrEqual(DESCRIBE_LIMITS.maxSchemaKeys)
		expect(normalizeLanguage(DEVELOPERS_SAMPLE_REQUEST.languageToTranslate)).toBe('fr')
		// a placeholder, never a real key
		expect(getDevelopersSampleCode()).toContain('Bearer YOUR_API_KEY')
		expect(getDevelopersSampleCode()).not.toMatch(/eyJ[\w-]+\./)
	})

	it('says what the service does: texts generated from the image, in the requested language', () => {
		const text = renderSection().textContent

		expect(text).toContain("in your site's language")
		expect(text).toContain('Each description is generated from the image, directly in that language.')
		expect(text).toContain('Call the API once per language to produce multilingual alt text.')
		expect(text).toContain('JPEG, PNG, WebP, and non-animated GIF, up to 10 MB.')
		expect(text).toContain('One credit per successfully processed image')
		// automatic generation on upload is an option of the plugin, off by default
		expect(text).toContain('turn on automatic generation for new uploads')
	})

	it('makes no promise the plugin or the API does not keep', () => {
		const text = renderSection().textContent

		for (const claim of FORBIDDEN_CLAIMS) {
			expect(text).not.toMatch(claim)
		}
	})
})

describe('Landing page order', () => {
	afterEach(cleanup)

	it('puts the developers section after the plugin and before the pricing', () => {
		const { container } = render(createElement(Home))

		const sections = [...container.querySelectorAll('main > *')].map(
			element => element.getAttribute('data-section') ?? element.id
		)
		expect(sections).toEqual(['hero', 'features', 'plugin', 'developers', 'pricing', 'cta'])
	})
})
