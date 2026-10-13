import { afterEach, describe, expect, it, vi } from 'vitest'
import {
	durationBucket,
	findEventElement,
	imageType,
	linkTarget,
	readEventData,
	setSignedIn,
	sizeBucket,
	slug,
	track,
	trackClick,
} from '@/helpers/analytics'

const KB = 1024
const MB = 1024 * KB

// the element the document listener of a test resolved for the next click
function resolveOnNextClick() {
	const result = { element: 'no click yet' }
	document.addEventListener(
		'click',
		event => {
			result.element = findEventElement(event)
		},
		{ once: true }
	)
	return result
}

afterEach(() => {
	vi.unstubAllGlobals()
	delete window.umami
	setSignedIn(undefined)
	document.body.innerHTML = ''
})

describe('track', () => {
	it('sends the event name and its properties to Umami', () => {
		window.umami = { track: vi.fn() }

		track('pricing-plan-click', { cycle: 'monthly', plan: 'starter' })

		expect(window.umami.track).toHaveBeenCalledTimes(1)
		expect(window.umami.track).toHaveBeenCalledWith('pricing-plan-click', { cycle: 'monthly', plan: 'starter' })
	})

	it('sends no data object for an event without property', () => {
		window.umami = { track: vi.fn() }

		track('tokens-key-copy')
		track('tokens-key-copy', {})

		expect(window.umami.track.mock.calls).toEqual([
			['tokens-key-copy', undefined],
			['tokens-key-copy', undefined],
		])
	})

	// localhost, CI, previews, ad blockers: the tracker is not there
	it('does nothing when the Umami tracker is not loaded', () => {
		expect(window.umami).toBeUndefined()
		expect(() => track('hero-cta-click', { target: 'wordpress-plugin' })).not.toThrow()
	})

	it.each([
		['is not an object', 'blocked'],
		['has no track function', {}],
		['is null', null],
	])('does nothing when window.umami %s', (_case, umami) => {
		window.umami = umami
		expect(() => track('hero-cta-click')).not.toThrow()
	})

	it('never throws when the tracker itself fails', () => {
		window.umami = {
			track: vi.fn(() => {
				throw new Error('tracker crashed')
			}),
		}

		expect(() => track('contact-form-submit', { outcome: 'ok' })).not.toThrow()
		expect(window.umami.track).toHaveBeenCalledTimes(1)
	})

	it('never throws on properties it cannot read', () => {
		window.umami = { track: vi.fn() }
		const hostile = new Proxy(
			{},
			{
				ownKeys() {
					throw new Error('unreadable')
				},
			}
		)

		expect(() => track('contact-form-submit', hostile)).not.toThrow()
	})

	it('does nothing on the server, where there is no window', () => {
		const umami = { track: vi.fn() }
		window.umami = umami
		vi.stubGlobal('window', undefined)

		expect(() => track('hero-cta-click')).not.toThrow()
		expect(umami.track).not.toHaveBeenCalled()
	})

	it('leaves the properties object of the caller untouched', () => {
		window.umami = { track: vi.fn() }
		setSignedIn(true)
		const properties = { outcome: 'ok' }

		track('contact-form-submit', properties)

		expect(properties).toEqual({ outcome: 'ok' })
	})
})

describe('signed_in segment', () => {
	it('is absent until Clerk has answered', () => {
		window.umami = { track: vi.fn() }

		track('nav-link-click', { target: 'pricing' })

		expect(window.umami.track).toHaveBeenCalledWith('nav-link-click', { target: 'pricing' })
	})

	it.each([true, false])('adds signed_in: %j to every event once known', known => {
		window.umami = { track: vi.fn() }
		setSignedIn(known)

		track('nav-link-click', { target: 'pricing' })
		track('tokens-key-copy')

		expect(window.umami.track.mock.calls).toEqual([
			['nav-link-click', { target: 'pricing', signed_in: known }],
			['tokens-key-copy', { signed_in: known }],
		])
	})

	it('only ever holds a boolean: an id or a user object is dropped', () => {
		window.umami = { track: vi.fn() }

		for (const value of ['user_2abc', { id: 'user_2abc' }, 1, null]) {
			setSignedIn(value)
			track('nav-link-click')
		}

		expect(window.umami.track.mock.calls.every(([, data]) => data === undefined)).toBe(true)
	})
})

describe('readEventData', () => {
	function element(html) {
		document.body.innerHTML = html
		return document.body.firstElementChild
	}

	it('reads the data-fv-event-* attributes as properties', () => {
		const link = element(
			'<a href="/app/plans" class="cta" data-testid="plan" data-fv-event="pricing-plan-click" data-fv-event-plan="growth" data-fv-event-cycle="annually" data-fv-event-location="landing">Subscribe</a>'
		)

		expect(readEventData(link)).toEqual({ plan: 'growth', cycle: 'annually', location: 'landing' })
	})

	it('turns a dash in the key into an underscore', () => {
		const button = element(
			'<button data-fv-event="x" data-fv-event-size-bucket="1mb-5mb" data-fv-event-has_context="true"></button>'
		)

		expect(readEventData(button)).toEqual({ size_bucket: '1mb-5mb', has_context: 'true' })
	})

	it('returns no property for an element that only names the event', () => {
		expect(readEventData(element('<button data-fv-event="tokens-create-click"></button>'))).toEqual({})
	})
})

describe('findEventElement', () => {
	it('finds the closest tracked ancestor of the clicked node', () => {
		document.body.innerHTML =
			'<div data-fv-event="outer"><a data-fv-event="inner" href="#x"><span><svg><path id="hit"></path></svg></span></a></div>'
		const found = resolveOnNextClick()

		document.getElementById('hit').dispatchEvent(new MouseEvent('click', { bubbles: true }))

		expect(found.element.getAttribute('data-fv-event')).toBe('inner')
	})

	it('returns null for a click outside any tracked element', () => {
		document.body.innerHTML = '<div><button id="hit">Generate Now!</button></div>'
		const found = resolveOnNextClick()

		document.getElementById('hit').click()

		expect(found.element).toBeNull()
	})

	// React commits between two listeners of a real click: an icon swapped by
	// the click handler is detached by the time the document listener runs
	it('still finds the tracked element once the clicked node was replaced', () => {
		document.body.innerHTML = '<button data-fv-event="dash-menu-toggle"><svg id="hit"></svg></button>'
		const button = document.body.firstElementChild
		button.addEventListener('click', () => {
			button.innerHTML = '<svg id="other"></svg>'
		})
		const found = resolveOnNextClick()

		document.getElementById('hit').dispatchEvent(new MouseEvent('click', { bubbles: true }))

		expect(found.element).toBe(button)
	})

	it('falls back on closest() for an event without a path', () => {
		document.body.innerHTML = '<a data-fv-event="footer-link-click" href="/contact"><span id="hit">Contact</span></a>'

		expect(findEventElement({ target: document.getElementById('hit') })).toBe(document.body.firstElementChild)
		expect(findEventElement({ target: null })).toBeNull()
		expect(findEventElement(undefined)).toBeNull()
	})
})

describe('trackClick', () => {
	function clickOn(html) {
		document.body.innerHTML = html
		const result = {}
		document.addEventListener(
			'click',
			event => {
				result.event = event
				trackClick(event)
			},
			{ once: true }
		)
		document.getElementById('hit').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
		return result.event
	}

	it('sends the event of the clicked element with its properties', () => {
		window.umami = { track: vi.fn() }

		clickOn('<a href="#x" data-fv-event="footer-link-click" data-fv-event-kind="nav"><span id="hit">Pricing</span></a>')

		expect(window.umami.track.mock.calls).toEqual([['footer-link-click', { kind: 'nav' }]])
	})

	it('sends one event per click, however many times the click is seen', () => {
		window.umami = { track: vi.fn() }

		const click = clickOn('<button id="hit" data-fv-event="tokens-create-click"></button>')
		trackClick(click)
		// the React event of a dialog panel wraps the same click
		trackClick({ nativeEvent: click })

		expect(window.umami.track).toHaveBeenCalledTimes(1)
	})

	it('accepts the React event of an onClick handler', () => {
		window.umami = { track: vi.fn() }
		document.body.innerHTML = '<button id="hit" data-fv-event="tokens-modal-close" data-fv-event-via="cancel"></button>'

		trackClick({ nativeEvent: { target: document.getElementById('hit') } })

		expect(window.umami.track.mock.calls).toEqual([['tokens-modal-close', { via: 'cancel' }]])
	})

	it('never cancels or stops the click', () => {
		window.umami = { track: vi.fn() }

		const click = clickOn('<a id="hit" href="#x" data-fv-event="nav-link-click"></a>')

		expect(click.defaultPrevented).toBe(false)
		expect(click.cancelBubble).toBe(false)
	})

	it('sends nothing for an untracked element or an empty event name', () => {
		window.umami = { track: vi.fn() }

		clickOn('<button id="hit">Generate Now!</button>')
		clickOn('<button id="hit" data-fv-event=""></button>')

		expect(window.umami.track).not.toHaveBeenCalled()
	})

	it.each([undefined, null, 'click', 42, {}, { nativeEvent: null }, { target: 'not a node' }])(
		'never throws on %j',
		event => {
			window.umami = { track: vi.fn() }

			expect(() => trackClick(event)).not.toThrow()
			expect(window.umami.track).not.toHaveBeenCalled()
		}
	)
})

describe('slug', () => {
	it.each([
		['Starter', 'starter'],
		['100 Credits', '100-credits'],
		['Do I need to know how to code?', 'do-i-need-to-know-how-to-code'],
		['  Help, FAQ & Contact ', 'help-faq-contact'],
		['', ''],
		[null, ''],
		[undefined, ''],
	])('%j -> %j', (text, expected) => {
		expect(slug(text)).toBe(expected)
	})

	it('cuts long texts without leaving a dash at the end', () => {
		const result = slug('Does this replace all my SEO or accessibility work, and what else should I check?', 30)

		expect(result).toBe('does-this-replace-all-my-seo-o')
		expect(slug('abcd efgh', 5)).toBe('abcd')
	})
})

describe('linkTarget', () => {
	it.each([
		['/', 'home'],
		['/#features', 'features'],
		['/#pricing', 'pricing'],
		['/wordpress-plugin', 'wordpress-plugin'],
		['/wordpress-plugin#how-it-works', 'how-it-works'],
		['#how-it-works', 'how-it-works'],
		['/contact', 'contact'],
		['/app', 'app'],
		['/app/tokens', 'app-tokens'],
		['/app/legals/privacy-policy', 'app-legals-privacy-policy'],
		['/profile', 'profile'],
		['https://forvoyez.com/app/plans', 'app-plans'],
		['https://doc.forvoyez.com/', 'doc'],
		['https://docs.forvoyez.com/describe', 'doc'],
		['https://wordpress.org/plugins/auto-alt-text-for-images/', 'wordpress-org'],
		['https://www.linkedin.com/company/forvoyez', 'linkedin-com'],
		['mailto:contact@forvoyez.com', 'email'],
		['tel:+33621582684', 'phone'],
	])('%s -> %s', (href, expected) => {
		expect(linkTarget(href)).toBe(expected)
	})

	it('never keeps a query string', () => {
		expect(linkTarget('/sign-in?redirect_url=https%3A%2F%2Fforvoyez.com%2Fapp')).toBe('sign-in')
		expect(linkTarget('https://forvoyez.lemonsqueezy.com/billing?expires=1&signature=abc')).toBe(
			'forvoyez-lemonsqueezy-com'
		)
	})

	it.each([undefined, null, 42, {}])('answers "unknown" for %j', href => {
		expect(linkTarget(href)).toBe('unknown')
	})
})

describe('buckets', () => {
	it.each([
		[0, 'under-100kb'],
		[100 * KB - 1, 'under-100kb'],
		[100 * KB, '100kb-1mb'],
		[MB, '1mb-5mb'],
		[5 * MB, '5mb-10mb'],
		[10 * MB, '5mb-10mb'],
		[10 * MB + 1, 'over-10mb'],
		[undefined, 'unknown'],
		[Number.NaN, 'unknown'],
		[-1, 'unknown'],
	])('sizeBucket(%j) is %s', (bytes, expected) => {
		expect(sizeBucket(bytes)).toBe(expected)
	})

	it.each([
		[0, 'under-2s'],
		[1999, 'under-2s'],
		[2000, '2s-5s'],
		[5000, '5s-10s'],
		[10_000, '10s-20s'],
		[20_000, 'over-20s'],
		[undefined, 'unknown'],
		[-5, 'unknown'],
	])('durationBucket(%j) is %s', (milliseconds, expected) => {
		expect(durationBucket(milliseconds)).toBe(expected)
	})
})

describe('imageType', () => {
	it.each([
		['image/png', 'png'],
		['image/jpeg', 'jpeg'],
		['IMAGE/WEBP', 'webp'],
		['image/svg+xml', 'svg+xml'],
		['image/heic', 'heic'],
		['application/pdf', 'other'],
		['', 'other'],
	])('%j -> %s', (type, expected) => {
		expect(imageType({ type, name: 'holiday-with-jane-doe.png' })).toBe(expected)
	})

	it('answers "other" without a file', () => {
		expect(imageType(null)).toBe('other')
		expect(imageType(undefined)).toBe('other')
		expect(imageType({})).toBe('other')
	})
})
