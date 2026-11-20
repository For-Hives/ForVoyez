import { logger } from '@/services/logger.service'

// Discord alert to the team when OpenAI stops answering for a reason only a
// human can fix (no credit left, key revoked). The webhook comes from the
// OPS_DISCORD_WEBHOOK_URL env var; without it nothing is sent.

// One message per alert kind per hour and per process: a customer retrying
// in a loop must not flood the channel.
const ALERT_INTERVAL_MS = 60 * 60 * 1000
const SEND_TIMEOUT_MS = 5000

const lastSentAt = new Map()

// OpenAI error codes that no retry will fix.
const BLOCKING_CODES = {
	credit_balance_exhausted: 'Plus de crédit OpenAI : recharger sur platform.openai.com > Billing.',
	insufficient_quota: 'Quota OpenAI épuisé : recharger sur platform.openai.com > Billing.',
	invalid_api_key: 'Clé OpenAI refusée : vérifier OPENAI_API_KEY sur Coolify.',
}

/** The alert kind for an OpenAI error, or null when it is transient. */
export function blockingAiFailure({ errorCode, errorType, statusCode }) {
	if (errorCode in BLOCKING_CODES) return errorCode
	if (errorType in BLOCKING_CODES) return errorType
	if (statusCode === 401) return 'invalid_api_key'
	return null
}

/**
 * Posts the alert to Discord, at most once an hour per kind. Never throws:
 * the customer's request must fail the same way with or without the alert.
 */
export async function alertAiFailure(kind, details = {}, now = Date.now()) {
	const url = process.env.OPS_DISCORD_WEBHOOK_URL?.trim()
	if (!(url && kind in BLOCKING_CODES)) return false
	const last = lastSentAt.get(kind)
	if (last !== undefined && now - last < ALERT_INTERVAL_MS) return false
	lastSentAt.set(kind, now)

	const lines = [
		`🚨 **ForVoyez : les descriptions d'images échouent** (\`${kind}\`)`,
		BLOCKING_CODES[kind],
		details.model ? `Modèle : \`${details.model}\`` : null,
		'Les crédits des clients sont remboursés. Prochaine alerte au plus tôt dans une heure.',
	]
	try {
		const response = await fetch(url, {
			body: JSON.stringify({ allowed_mentions: { parse: [] }, content: lines.filter(Boolean).join('\n') }),
			headers: { 'Content-Type': 'application/json' },
			signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
			method: 'POST',
		})
		if (!response.ok) logger.error('Ops alert not delivered:', response.status)
		return response.ok
	} catch (error) {
		logger.error('Ops alert not delivered:', error?.name)
		return false
	}
}

export const TestingExports = {
	reset: () => lastSentAt.clear(),
}
