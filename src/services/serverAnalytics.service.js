import { after } from 'next/server'

import { UMAMI_WEBSITE_ID } from '@/constants/umami'
import { slug } from '@/helpers/analytics'

import 'server-only'

// Server-side Umami events for the public API. Its callers are servers and
// the WordPress plugin, which the browser tracker never sees. Neither does it
// see a purchase: the checkout is on Lemon Squeezy's domain, only its webhook
// reaches this server.
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
	// both are reported from the Lemon Squeezy webhook
	['api-purchase', '/api/webhook'],
	['api-subscription-change', '/api/webhook'],
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

// Outcome of a Lemon Squeezy event (webhook.service) -> its event
const WEBHOOK_EVENTS = new Map([
	['purchase', 'api-purchase'],
	['subscription-change', 'api-subscription-change'],
])

// Everything a webhook event can say, besides the slug of a plan name and a
// number of credits: any other value is reported as 'other'.
const PURCHASE_KINDS = new Set(['subscription', 'refill'])
const PURCHASE_REASONS = new Set(['first-order', 'renewal', 'plan-change'])
const SUBSCRIPTION_CHANGES = new Set(['created', 'cancelled', 'resumed', 'plan-changed', 'updated'])
// Lemon Squeezy's subscription statuses, as slugs ('past_due' -> 'past-due')
const SUBSCRIPTION_STATUSES = new Set(['on-trial', 'active', 'paused', 'past-due', 'unpaid', 'cancelled', 'expired'])
// Plan.billingCycle is Lemon Squeezy's renewal unit; a plan without one (a
// credit pack) is paid once.
const BILLING_CYCLES = new Set(['month', 'year'])
const ONE_TIME = 'one-time'
const OTHER = 'other'

const UNKNOWN_PLAN = { cycle: 'unknown', plan: 'unknown' }

/**
 * @typedef {Record<string, string|number|boolean>} EventData event properties, nothing personal
 */

/**
 * Sends one Umami event for an API call, after the response is sent. Never
 * throws and never delays the response.
 * @param {Request} request the API request (only its host is read here)
 * @param {string} name a key of EVENT_URLS
 * @param {EventData | (() => Promise<EventData>)} data the event properties, or a
 *   function that reads them: called once the response is sent, for
 *   properties that take a query
 */
export function trackServerEvent(request, name, data) {
	try {
		const url = EVENT_URLS.get(name)
		if (!(url && isTrackedHost(request))) return

		if (typeof data === 'function') {
			after(() => sendLater(name, url, data))
			return
		}

		// built now, so the task below keeps neither the request nor its body
		const body = eventBody(name, url, data)
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

/**
 * `api-purchase` (a payment granted credits) or `api-subscription-change`: one
 * event per Lemon Squeezy event, once it is processed for the first time.
 * @param {Request} request the webhook delivery (only its host is read)
 * @param {object} outcome what the event did, as processWebhook reports it: which plan, never who
 * @param {(variantId: string|number) => Promise<{name: string, billingCycle: string|null}|null>} [readPlan]
 *   reads the plan of an outcome that only names its variant; called once the response is sent
 */
export function trackWebhookOutcome(request, outcome, readPlan) {
	try {
		const name = WEBHOOK_EVENTS.get(outcome.type)
		if (!name) return

		const { variantId, plan } = outcome
		if (plan || variantId == null || typeof readPlan !== 'function') {
			trackServerEvent(request, name, webhookEventData(outcome, plan))
			return
		}
		// the plan was not read while the event was processed: no query for it
		// before the response
		trackServerEvent(request, name, async () => webhookEventData(outcome, await readInTime(readPlan, variantId)))
	} catch {
		// same rule as above
	}
}

function eventBody(name, url, data) {
	return JSON.stringify({
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

// The properties of a webhook event, picked one by one: whatever else an
// outcome holds stays here. `plan` is the slug the browser events give the
// same plan (pricing-plan-click, plans-checkout-click), to follow it from the
// click to the purchase.
function webhookEventData(outcome, plan) {
	const about =
		plan && typeof plan === 'object'
			? { cycle: billingCycle(plan.billingCycle), plan: slug(plan.name) || UNKNOWN_PLAN.plan }
			: UNKNOWN_PLAN

	if (outcome.type === 'purchase') {
		return {
			credits: Number.isFinite(outcome.credits) ? outcome.credits : 0,
			reason: oneOf(PURCHASE_REASONS, outcome.reason),
			kind: oneOf(PURCHASE_KINDS, outcome.kind),
			...about,
		}
	}

	const event = oneOf(SUBSCRIPTION_CHANGES, outcome.change)
	// only an `updated` says which status: the other changes are one each
	return event === 'updated'
		? { status: oneOf(SUBSCRIPTION_STATUSES, slug(outcome.status)), event, ...about }
		: { event, ...about }
}

function billingCycle(value) {
	return value == null ? ONE_TIME : oneOf(BILLING_CYCLES, value)
}

function oneOf(values, value) {
	return values.has(value) ? value : OTHER
}

// A plan read after the response, for an outcome that only names its variant.
// Null when the database fails or takes longer than a send to Umami may: the
// event then leaves with an unknown plan.
async function readInTime(readPlan, variantId) {
	let timer
	try {
		return await Promise.race([
			readPlan(variantId),
			new Promise(resolve => {
				timer = setTimeout(resolve, SEND_TIMEOUT_MS, null)
			}),
		])
	} catch {
		return null
	} finally {
		clearTimeout(timer)
	}
}

// For properties that are read once the response is sent (see trackServerEvent)
async function sendLater(name, url, readData) {
	try {
		await send(eventBody(name, url, await readData()))
	} catch {
		// a lost event is not worth a log line
	}
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
