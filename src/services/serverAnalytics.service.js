import { after } from 'next/server'

import { UMAMI_WEBSITE_ID } from '@/constants/umami'

import 'server-only'

// Server-side Umami events for the public API. Its callers are servers and
// the WordPress plugin, which the browser tracker never sees.
// Best effort only: an event leaves after the response is sent, has 2 s to
// reach Umami, and is dropped without a log line when anything goes wrong.

const UMAMI_SEND_URL = 'https://umami.wadefade.fr/api/send'

// Like the browser tracker and its data-domains: only production reports,
// local, CI and preview runs stay silent.
const TRACKED_HOSTS = new Set(['forvoyez.com', 'www.forvoyez.com'])

// Event name -> path it is reported under. Fixed strings: the request URL
// and its query string are never sent.
const EVENT_URLS = new Map([
	['api-describe', '/api/describe'],
	['api-tokens-check', '/api/tokens'],
])

// Umami ignores a request without a User-Agent or with one that looks like a
// bot (Node's default does), hence a browser one. The caller's own IP and
// User-Agent are not forwarded: Umami sees this server as a single visitor.
const USER_AGENT =
	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'

const SEND_TIMEOUT_MS = 2000

// When Umami is slow, events are dropped instead of piling up behind it.
const MAX_PENDING_SENDS = 20
let pendingSends = 0

// One token of the X-ForVoyez-Client header ("wordpress-plugin/1.1.43"): at
// most 40 characters. Anything else is discarded whole, never cut to fit.
const CLIENT_TOKEN = /^[a-z0-9][a-z0-9.-]{0,39}$/
const UNKNOWN_VERSION = 'unknown'

const NOT_BLANK = /\S/

/**
 * Sends one Umami event for an API call, after the response is sent. Never
 * throws and never delays the response.
 * @param {Request} request the API request (only its host is read here)
 * @param {string} name a key of EVENT_URLS
 * @param {Record<string, string|number|boolean>} data event properties, nothing personal
 */
export function trackServerEvent(request, name, data) {
	try {
		const url = EVENT_URLS.get(name)
		if (!(url && isTrackedHost(request))) return

		// built now, so the task below keeps neither the request nor its body
		const body = JSON.stringify({
			payload: {
				website: UMAMI_WEBSITE_ID,
				hostname: 'forvoyez.com',
				language: '',
				referrer: '',
				screen: '',
				title: '',
				name,
				data,
				url,
			},
			type: 'event',
		})
		after(() => send(body))
	} catch {
		// statistics must never break an API call
	}
}

/**
 * `api-describe`: one event per POST /api/describe, whatever its outcome.
 * @param {Request} request
 * @param {Response} response the answer about to be returned, left untouched
 * @param {FormData} [formData] the parsed body, missing when the request was refused before
 */
export function trackDescribeCall(request, response, formData) {
	try {
		trackServerEvent(request, 'api-describe', {
			outcome: response.ok ? 'ok' : 'error',
			status: response.status,
			...apiClient(request),
			...sentFields(formData),
		})
	} catch {
		// same rule as above
	}
}

/**
 * `api-tokens-check`: one event per GET /api/tokens (the plugin calls it when
 * an API key is saved and on its dashboard tab).
 * @param {Request} request
 * @param {Response} response the answer about to be returned, left untouched
 */
export function trackTokensCheck(request, response) {
	try {
		trackServerEvent(request, 'api-tokens-check', {
			status: response.status,
			...apiClient(request),
		})
	} catch {
		// same rule as above
	}
}

function isTrackedHost(request) {
	// the reverse proxy passes the public host in X-Forwarded-Host
	const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
	return TRACKED_HOSTS.has(host.split(',')[0].trim().toLowerCase())
}

// Who is calling: the plugin names itself in X-ForVoyez-Client, older plugin
// versions are only known by the WordPress User-Agent, the rest is "api".
function apiClient(request) {
	const [name, version, ...rest] = String(request.headers.get('x-forvoyez-client') ?? '')
		.trim()
		.toLowerCase()
		.split('/')
	if (CLIENT_TOKEN.test(name)) {
		const hasVersion = rest.length === 0 && CLIENT_TOKEN.test(version ?? '')
		return { client_version: hasVersion ? version : UNKNOWN_VERSION, client: name }
	}

	// "WordPress/6.8; https://customer-site.example": the site URL is not kept
	if (String(request.headers.get('user-agent') ?? '').startsWith('WordPress/')) {
		return { client_version: UNKNOWN_VERSION, client: 'wordpress' }
	}
	return { client_version: UNKNOWN_VERSION, client: 'api' }
}

// Which optional fields were sent, never their content. Left out when the
// request was refused before its body was parsed (unknown, not "false").
function sentFields(formData) {
	if (!formData) return {}
	return {
		language_given: isFilled(formData.get('language')),
		custom_schema: isFilled(formData.get('schema')),
		has_context: isFilled(formData.get('context')),
	}
}

function isFilled(value) {
	return typeof value === 'string' && NOT_BLANK.test(value)
}

async function send(body) {
	if (pendingSends >= MAX_PENDING_SENDS) return
	pendingSends += 1
	try {
		const response = await fetch(UMAMI_SEND_URL, {
			headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
			signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
			cache: 'no-store',
			method: 'POST',
			body,
		})
		// the answer is not read: free the connection
		await response.body?.cancel()
	} catch {
		// a lost event is not worth a log line
	} finally {
		pendingSends -= 1
	}
}
