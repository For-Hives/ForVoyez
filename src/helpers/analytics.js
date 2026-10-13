// Custom Umami events. The tracker loaded by the root layout only runs on the
// hosts of its data-domains: on the server, on localhost, in the tests and when
// a blocker removed it, everything here does nothing and never throws.
//
// Names are kebab-case `<area>-<object>-<action>`, 50 characters at most.
// Properties are short values that identify nobody: never an email, a name, a
// user id, an API key or its name, a file name, or what a visitor typed.

export const EVENT_ATTRIBUTE = 'data-fv-event'
const PROPERTY_PREFIX = `${EVENT_ATTRIBUTE}-`

const KILOBYTE = 1024
const MEGABYTE = 1024 * KILOBYTE
const SECOND = 1000

const NOT_SLUG_CHARACTERS = /[^a-z0-9]+/g
const EDGE_DASHES = /^-+|-+$/g
const WWW_PREFIX = /^www\./

const OWN_HOST = 'forvoyez.com'
const KNOWN_SITES = {
	'doc.forvoyez.com': 'doc',
	'docs.forvoyez.com': 'doc',
	'wordpress.org': 'wordpress-org',
}

// Signed in or not, never who. Unknown until Clerk has answered.
let signedIn

// One click can be seen twice, by a dialog panel then by the document.
const sentClicks = new WeakSet()

export function setSignedIn(value) {
	signedIn = typeof value === 'boolean' ? value : undefined
}

export function track(name, data) {
	if (typeof window === 'undefined') return
	try {
		const payload = signedIn === undefined ? { ...data } : { ...data, signed_in: signedIn }
		window.umami?.track(name, Object.keys(payload).length > 0 ? payload : undefined)
	} catch {
		// measuring must never break the page
	}
}

// Sends the event named by the data-fv-event attribute of the clicked element,
// or of its closest ancestor that has one. At most one event per click.
// The document listener of the root layout calls it for every click that
// reaches the document. A Headless UI dialog panel stops its clicks before
// that, so each one forwards them itself: <Dialog.Panel onClick={trackClick}>.
export function trackClick(event) {
	try {
		const click = event?.nativeEvent ?? event
		if (!click || sentClicks.has(click)) return
		const element = findEventElement(click)
		const name = element?.getAttribute(EVENT_ATTRIBUTE)
		if (!name) return
		sentClicks.add(click)
		track(name, readEventData(element))
	} catch {
		// measuring must never break the page
	}
}

// The tracked element a click happened in. The event path is fixed when the
// click is dispatched, so it still holds once React has replaced the clicked
// node (icon swap, closed dialog), unlike closest() on a detached target.
export function findEventElement(event) {
	const path = typeof event?.composedPath === 'function' ? event.composedPath() : []
	for (const node of path) {
		if (node instanceof Element && node.hasAttribute(EVENT_ATTRIBUTE)) return node
	}
	return event?.target instanceof Element ? event.target.closest(`[${EVENT_ATTRIBUTE}]`) : null
}

// data-fv-event-<key>="<value>" attributes as { key: value }. A dash in the key
// becomes an underscore: data-fv-event-size-bucket is the property size_bucket.
export function readEventData(element) {
	const data = {}
	for (const attribute of element.attributes) {
		if (attribute.name.startsWith(PROPERTY_PREFIX)) {
			data[attribute.name.slice(PROPERTY_PREFIX.length).replaceAll('-', '_')] = attribute.value
		}
	}
	return data
}

// 'Do I need to know how to code?' -> 'do-i-need-to-know-how-to-code'
export function slug(text, maxLength = 60) {
	return String(text ?? '')
		.toLowerCase()
		.replace(NOT_SLUG_CHARACTERS, '-')
		.slice(0, maxLength)
		.replace(EDGE_DASHES, '')
}

// Where a link goes, for the `target` property: its anchor ('/#pricing' ->
// 'pricing'), else its path ('/app/tokens' -> 'app-tokens', '/' -> 'home'),
// else the other site ('https://doc.forvoyez.com/' -> 'doc'). The query string
// is never part of it.
export function linkTarget(href) {
	if (typeof href !== 'string') return 'unknown'
	if (href.startsWith('mailto:')) return 'email'
	if (href.startsWith('tel:')) return 'phone'

	let url
	try {
		url = new URL(href, `https://${OWN_HOST}`)
	} catch {
		return 'unknown'
	}

	if (url.hostname !== OWN_HOST) {
		return KNOWN_SITES[url.hostname] ?? slug(url.hostname.replace(WWW_PREFIX, ''))
	}
	if (url.hash.length > 1) return slug(url.hash)
	return slug(url.pathname) || 'home'
}

export function sizeBucket(bytes) {
	if (!Number.isFinite(bytes) || bytes < 0) return 'unknown'
	if (bytes < 100 * KILOBYTE) return 'under-100kb'
	if (bytes < MEGABYTE) return '100kb-1mb'
	if (bytes < 5 * MEGABYTE) return '1mb-5mb'
	if (bytes <= 10 * MEGABYTE) return '5mb-10mb'
	return 'over-10mb'
}

export function durationBucket(milliseconds) {
	if (!Number.isFinite(milliseconds) || milliseconds < 0) return 'unknown'
	if (milliseconds < 2 * SECOND) return 'under-2s'
	if (milliseconds < 5 * SECOND) return '2s-5s'
	if (milliseconds < 10 * SECOND) return '5s-10s'
	if (milliseconds < 20 * SECOND) return '10s-20s'
	return 'over-20s'
}

// 'image/svg+xml' -> 'svg+xml'. The browser derives the type from the file
// extension: it says nothing about the file name or its content.
export function imageType(file) {
	const type = typeof file?.type === 'string' ? file.type.toLowerCase() : ''
	if (!type.startsWith('image/')) return 'other'
	return type.slice('image/'.length, 'image/'.length + 20) || 'other'
}
