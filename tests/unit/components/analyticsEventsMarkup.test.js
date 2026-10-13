import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { act, cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalyticsEventsComponent } from '@/components/Analytics/AnalyticsEvents.component'
import { NavigationAppComponent } from '@/components/App/NavigationApp.component'
import { ResourceCardAppComponent } from '@/components/App/ResourceCardApp.component'
import { FooterComponent } from '@/components/Footer.component'
import { CtaComponent } from '@/components/Landing/Cta/Cta.component'
import { HeroComponent } from '@/components/Landing/Hero/Hero.component'
import { PluginComponent } from '@/components/Landing/Plugin/Plugin.component'
import { NavbarComponent } from '@/components/Navbar.component'
import { CtaPluginComponent } from '@/components/WordpressPlugin/CtaPlugin.component'
import { HeroSectionComponent } from '@/components/WordpressPlugin/HeroSection.component'
import { HowItWorksComponent } from '@/components/WordpressPlugin/HowItWorks.component'
import { EVENT_ATTRIBUTE, setSignedIn } from '@/helpers/analytics'

// both branches of <Show> and the real child of <SignInButton>, to read their attributes
vi.mock('@clerk/nextjs', () => ({
	Show: ({ children }) => children,
	SignInButton: ({ children }) => children,
	UserButton: () => null,
	useAuth: () => ({ isLoaded: false }),
	useUser: () => ({ user: { firstName: 'Ada', lastName: 'Lovelace' } }),
}))
vi.mock('next/navigation', () => ({ usePathname: () => '/profile' }))
// the typing effect of the hero keeps running after the test, when jsdom is gone
vi.mock('react-type-animation', () => ({ TypeAnimation: () => null }))
// `require('package.json')` is resolved by Next's bundler only
vi.mock('@/helpers/version', () => ({ default: 'v0.0.0-test' }))

const SOURCE_DIRECTORY = path.join(process.cwd(), 'src')

// the areas of the naming convention, `api` being the server-side events
const AREAS = [
	'api',
	'auth',
	'billing',
	'contact',
	'dash',
	'developers',
	'footer',
	'hero',
	'landing',
	'legal',
	'nav',
	'plans',
	'playground',
	'pricing',
	'tokens',
	'usage',
	'wp',
]

// everything this file's components and the rest of the app must keep sending
const EXPECTED_EVENTS = [
	'billing-portal-redirect',
	'contact-faq-toggle',
	'contact-form-invalid',
	'contact-form-submit',
	'contact-link-click',
	'dash-card-click',
	'dash-menu-toggle',
	'dash-nav-click',
	'footer-link-click',
	'hero-cta-click',
	'landing-cta-click',
	'legal-card-click',
	'nav-link-click',
	'nav-menu-toggle',
	'nav-sign-in-click',
	'plans-checkout-click',
	'plans-checkout-result',
	'plans-portal-click',
	'playground-analyze-click',
	'playground-analyze-result',
	'playground-code-copy',
	'playground-image-remove',
	'playground-image-select',
	'playground-no-credits-click',
	'playground-no-credits-view',
	'playground-option-toggle',
	'playground-preview-tab-select',
	'pricing-contact-click',
	'pricing-cycle-toggle',
	'pricing-plan-click',
	'pricing-plans-error',
	'tokens-create-click',
	'tokens-create-result',
	'tokens-delete-click',
	'tokens-delete-result',
	'tokens-key-copy',
	'tokens-modal-close',
	'usage-data-view',
	'wp-cta-click',
	'wp-faq-toggle',
]

// a property named like this would carry personal data or a secret
const FORBIDDEN_PROPERTIES =
	/^(e-?mail|name|first-?name|last-?name|user|user-?id|clerk-?id|session|key|api-?key|token|jwt|secret|file|file-?name|context|keywords|schema|message|phone|company|subject|url|href|query)$/

function sourceFiles(directory = SOURCE_DIRECTORY) {
	return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		const file = path.join(directory, entry.name)
		if (entry.isDirectory()) return entry.name === 'generated' ? [] : sourceFiles(file)
		return /\.(js|jsx|ts|tsx|mjs)$/.test(entry.name) ? [file] : []
	})
}

const sources = sourceFiles().map(file => ({
	content: readFileSync(file, 'utf8'),
	file: path.relative(SOURCE_DIRECTORY, file),
}))

// every event name written in the sources: attribute values (a literal or the
// literals of an expression) and first arguments of track()
function eventNamesIn(content) {
	const names = []
	for (const [, literal, expression] of content.matchAll(/data-fv-event=(?:"([^"]*)"|\{([^}]*)\})/g)) {
		if (literal !== undefined) names.push(literal)
		else names.push(...[...expression.matchAll(/'([^']*)'/g)].map(([, name]) => name))
	}
	for (const [, name] of content.matchAll(/\btrack\(\s*'([^']*)'/g)) names.push(name)
	return names
}

function tracked(container, name) {
	return [...container.querySelectorAll(`[${EVENT_ATTRIBUTE}="${name}"]`)]
}

function properties(element) {
	return Object.fromEntries(
		[...element.attributes]
			.filter(attribute => attribute.name.startsWith(`${EVENT_ATTRIBUTE}-`))
			.map(attribute => [attribute.name.slice(EVENT_ATTRIBUTE.length + 1), attribute.value])
	)
}

beforeEach(() => {
	window.umami = { track: vi.fn() }
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe() {}
			unobserve() {}
			disconnect() {}
		}
	)
})

afterEach(() => {
	cleanup()
	vi.useRealTimers()
	vi.unstubAllGlobals()
	delete window.umami
	setSignedIn(undefined)
})

describe('event names and properties written in the sources', () => {
	const occurrences = sources.flatMap(({ file, content }) => eventNamesIn(content).map(name => ({ file, name })))

	// Umami's tracker cancels the click on a link carrying its attribute, then
	// navigates by itself: next/link falls back to a full page load
	it('never uses data-umami-event, on a link or anywhere else', () => {
		// as a JSX attribute or as a key of a props object
		const offenders = sources
			.filter(({ content }) => /data-umami-event[a-z0-9-]*['"]?\s*[=:]/.test(content))
			.map(({ file }) => file)

		expect(offenders, 'use data-fv-event, see src/helpers/analytics.js').toEqual([])
	})

	it('finds the events of the app', () => {
		const names = new Set(occurrences.map(({ name }) => name))

		expect([...names].sort()).toEqual(expect.arrayContaining(EXPECTED_EVENTS))
	})

	it('names every event <area>-<object>-<action> in kebab-case, 50 characters at most', () => {
		const invalid = occurrences.filter(
			({ name }) => !/^[a-z0-9]+(-[a-z0-9]+){2,}$/.test(name) || name.length > 50 || !AREAS.includes(name.split('-')[0])
		)

		expect(invalid).toEqual([])
	})

	it('has no property that would carry personal data or a secret', () => {
		const offenders = sources.flatMap(({ file, content }) =>
			[...content.matchAll(/data-fv-event-([a-z0-9_-]+)=/g)]
				.map(([, key]) => key)
				.filter(key => FORBIDDEN_PROPERTIES.test(key.replaceAll('_', '-')))
				.map(key => `${file}: ${key}`)
		)

		expect(offenders).toEqual([])
	})

	it('never identifies the visitor to Umami', () => {
		const offenders = sources.filter(({ content }) => /umami\??\.identify/.test(content)).map(({ file }) => file)

		expect(offenders).toEqual([])
	})
})

describe('root layout', () => {
	const layout = sources.find(({ file }) => file === path.join('app', 'layout.js')).content

	it('measures the app, the docs and the docs alias', () => {
		expect(layout).toContain("data-domains={'forvoyez.com,doc.forvoyez.com,docs.forvoyez.com'}")
	})

	it('mounts the click listener once', () => {
		expect(layout.match(/<AnalyticsEventsComponent \/>/g)).toHaveLength(1)
	})
})

describe('landing', () => {
	it('tracks the hero call to action', () => {
		// the hero animation runs on timers: none may outlive the test
		vi.useFakeTimers()
		const { container } = render(createElement(HeroComponent))

		const [cta] = tracked(container, 'hero-cta-click')
		expect(cta.textContent).toBe('Get the WordPress plugin')
		expect(cta.getAttribute('href')).toBe('/wordpress-plugin')
		expect(properties(cta)).toEqual({ target: 'wordpress-plugin' })
	})

	// the demo button of the hero is clicked by a script 2.8 s after the page
	// loads: an event on it would be sent by every visit
	it('sends nothing for the hero demo button clicked by its own animation', () => {
		vi.useFakeTimers()
		const { container } = render(
			createElement('div', null, createElement(AnalyticsEventsComponent), createElement(HeroComponent))
		)
		const demoButtons = [...container.querySelectorAll('.bubbly-button')]
		const scriptedClick = vi.fn()
		demoButtons[0].addEventListener('click', scriptedClick)

		act(() => vi.advanceTimersByTime(8000))

		expect(scriptedClick).toHaveBeenCalled()
		expect(demoButtons.filter(button => button.closest(`[${EVENT_ATTRIBUTE}]`))).toEqual([])
		expect(window.umami.track).not.toHaveBeenCalled()
	})

	it('tracks the plugin section link without touching its href', () => {
		const { container } = render(createElement(PluginComponent))

		const [cta] = tracked(container, 'landing-cta-click')
		expect(cta.getAttribute('href')).toBe('/wordpress-plugin')
		expect(properties(cta)).toEqual({ location: 'plugin-section', target: 'wordpress-plugin' })
	})

	it('tells the two links of the final call to action apart', () => {
		render(createElement(CtaComponent))

		expect(properties(screen.getByTestId('cta-generate-link'))).toEqual({
			location: 'final-cta',
			target: 'wordpress-org',
		})
		expect(screen.getByTestId('cta-generate-link').getAttribute('href')).toBe(
			'https://wordpress.org/plugins/auto-alt-text-for-images/'
		)
		expect(properties(screen.getByTestId('cta-learn-more-link'))).toEqual({
			location: 'final-cta',
			target: 'how-it-works',
		})
	})
})

describe('navbar', () => {
	it('tracks every link with where it is and where it goes', () => {
		const { container } = render(createElement(NavbarComponent))

		const links = tracked(container, 'nav-link-click').map(properties)
		expect(links).toEqual(
			expect.arrayContaining([
				{ location: 'header', target: 'logo' },
				{ location: 'header', target: 'home' },
				{ location: 'header', target: 'features' },
				{ location: 'header', target: 'pricing' },
				{ location: 'header', target: 'wordpress-plugin' },
				{ location: 'header', target: 'contact' },
				{ location: 'header', target: 'app' },
			])
		)
		// a link added to the menu later is tracked like the others
		expect(links.every(link => link.location === 'header' && link.target)).toBe(true)
		expect(container.querySelectorAll(`a:not([${EVENT_ATTRIBUTE}])`)).toHaveLength(0)
	})

	it('tracks the sign-in button rendered through Clerk and the menu button', () => {
		const { container } = render(createElement(NavbarComponent))

		const [signIn] = tracked(container, 'nav-sign-in-click')
		expect(signIn.tagName).toBe('BUTTON')
		expect(signIn.textContent).toBe('Sign in')
		expect(properties(signIn)).toEqual({ location: 'header' })
		expect(properties(screen.getByTestId('menu-open-button'))).toEqual({ action: 'open' })
		expect(screen.getByTestId('menu-open-button').getAttribute(EVENT_ATTRIBUTE)).toBe('nav-menu-toggle')
	})
})

describe('footer', () => {
	it('tracks the navigation and the social links', async () => {
		const { container } = render(await FooterComponent())

		const links = tracked(container, 'footer-link-click').map(link => ({
			...properties(link),
			href: link.getAttribute('href'),
		}))
		expect(links).toEqual(
			expect.arrayContaining([
				{ kind: 'nav', target: 'home', href: '/' },
				{ kind: 'nav', target: 'features', href: '/#features' },
				{ kind: 'nav', target: 'pricing', href: '/#pricing' },
				{ kind: 'nav', target: 'wordpress-plugin', href: '/wordpress-plugin' },
				{ kind: 'nav', target: 'doc', href: 'https://doc.forvoyez.com/' },
				{ kind: 'nav', target: 'app-legals', href: '/app/legals' },
				{ kind: 'nav', target: 'contact', href: '/contact' },
				{ kind: 'social', target: 'discord', href: 'https://discord.gg/ErnvEwHexQ' },
				{ kind: 'social', target: 'facebook', href: 'https://facebook.com/forvoyez' },
				{ kind: 'social', target: 'instagram', href: 'https://instagram.com/forvoyez' },
				{ kind: 'social', target: 'github', href: 'https://github.com/For-Hives/ForVoyez' },
				{ kind: 'social', target: 'linkedin', href: 'https://www.linkedin.com/company/forvoyez' },
			])
		)
		// a link added to the footer later is tracked like the others
		expect(links.every(link => ['nav', 'social'].includes(link.kind) && link.target)).toBe(true)
		expect(container.querySelectorAll(`a:not([${EVENT_ATTRIBUTE}])`)).toHaveLength(0)
	})
})

describe('/wordpress-plugin', () => {
	it('tracks its calls to action by section', () => {
		const { container } = render(
			createElement(
				'div',
				null,
				createElement(HeroSectionComponent),
				createElement(HowItWorksComponent),
				createElement(CtaPluginComponent)
			)
		)

		const links = tracked(container, 'wp-cta-click').map(link => ({
			...properties(link),
			href: link.getAttribute('href'),
		}))
		expect(links).toEqual([
			{ location: 'hero', target: 'wordpress-org', href: 'https://wordpress.org/plugins/auto-alt-text-for-images/' },
			{ location: 'hero', target: 'how-it-works', href: '#how-it-works' },
			{ location: 'how-it-works', target: 'app-tokens', href: '/app/tokens' },
			{
				location: 'final-cta',
				target: 'wordpress-org',
				href: 'https://wordpress.org/plugins/auto-alt-text-for-images/',
			},
		])
	})
})

describe('dashboard', () => {
	it('tracks the sidebar links, the documentation being the only outbound one', () => {
		const { container } = render(createElement(NavigationAppComponent))

		const links = tracked(container, 'dash-nav-click').map(properties)
		expect(links).toEqual(
			expect.arrayContaining([
				{ location: 'sidebar', target: 'app' },
				{ location: 'sidebar', target: 'doc' },
				{ location: 'sidebar', target: 'app-playground' },
				{ location: 'sidebar', target: 'app-tokens' },
				{ location: 'sidebar', target: 'app-usage' },
				{ location: 'sidebar', target: 'app-plans' },
				{ location: 'sidebar', target: 'contact' },
				{ location: 'sidebar', target: 'app-billing' },
				{ location: 'sidebar', target: 'app-legals' },
				{ location: 'mobile-menu', target: 'profile' },
			])
		)
		// a page added to the sidebar later is tracked like the others
		expect(container.querySelectorAll(`a:not([${EVENT_ATTRIBUTE}])`)).toHaveLength(0)
		// the profile link shows the name of the user: it must not become a property
		expect(container.innerHTML).toContain('Ada')
		expect(JSON.stringify(links)).not.toMatch(/Ada|Lovelace/)
	})

	it.each([
		['/app/playground', 'dash-card-click', 'app-playground'],
		['/wordpress-plugin', 'dash-card-click', 'wordpress-plugin'],
		['/app/legals/privacy-policy', 'legal-card-click', 'app-legals-privacy-policy'],
	])('tracks the card to %s as %s', (href, event, target) => {
		const resource = { href, name: 'A card', description: 'Its text', testId: 'card', icon: () => null, pattern: {} }
		render(createElement(ResourceCardAppComponent, { resource }))

		const link = screen.getByRole('link', { name: 'A card' })
		expect(link.getAttribute(EVENT_ATTRIBUTE)).toBe(event)
		expect(properties(link)).toEqual({ target })
		expect(link.getAttribute('href')).toBe(href)
	})
})
