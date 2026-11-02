'use server'
import { headers } from 'next/headers'
import { createRateLimiter } from '@/helpers/rateLimit'

const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)
const mg = mailgun.client({
	key: process.env.MAILGUN_API_KEY,
	username: 'api',
})

// one address, no whitespace (so no header folding) and no list separators
const REPLY_TO_PATTERN = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/
const LINE_BREAKS = /[\r\n]+/g

// This action can be called without the form, whose checks run in the browser,
// and with bodies up to serverActions.bodySizeLimit (11 MB, for the playground).
const MAX_LENGTHS = {
	'phone-number': 50,
	'first-name': 100,
	'last-name': 100,
	message: 20_000,
	company: 200,
	subject: 200,
	email: 320,
}

const TOO_MANY_MESSAGES = {
	details: 'Too many messages were sent. Please try again later.',
	success: false,
	status: 429,
}

// Each message is a paid send to one inbox. The total holds even when the
// address of the visitor cannot be trusted or is missing.
const isAllowedForAddress = createRateLimiter({ windowMs: 10 * 60 * 1000, limit: 5 })
const isAllowedInTotal = createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 60 })

export async function sendEmail(data) {
	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		return { success: false, status: 400, details: 'Invalid contact form data' }
	}
	const {
		'first-name': firstName,
		'last-name': lastName,
		'phone-number': phone,
		company,
		subject,
		message,
		email,
	} = data

	if (Object.entries(MAX_LENGTHS).some(([field, maxLength]) => String(data[field] ?? '').length > maxLength)) {
		return { success: false, status: 400, details: 'One of the fields is too long.' }
	}

	if (!(await hasQuotaLeft())) {
		return TOO_MANY_MESSAGES
	}

	// FIXME change the email address to the correct one
	// paid option to get the real email address (to contact@forvoyez)
	// ill redirect the mails if needed to the correct email address
	try {
		await mg.messages.create(process.env.MAILGUN_DOMAIN, {
			text: `
        Prénom: ${firstName}
        Nom: ${lastName}
        Entreprise: ${company}
        Email: ${email}
        Téléphone: ${phone}
        
        Message:
        ${message}`,
			subject: `New contact message - ${String(subject ?? '').replace(LINE_BREAKS, ' ')}`,
			from: 'ForVoyez <noreply@forvoyez.com>',
			to: 'contact@andy-cinquin.fr',
			// "Reply" answers the visitor instead of noreply@forvoyez.com
			...replyToHeader(email),
		})

		return { success: true, status: 200 }
	} catch (error) {
		return {
			details:
				'An error occurred while sending the email. Please try again later. If the problem persists, please contact the website administrator. ' +
				'(through contact@forvoyez.com)',
			status: error.status,
			success: false,
		}
	}
}

async function hasQuotaLeft() {
	const address = await visitorAddress()
	if (address && !isAllowedForAddress(address)) {
		return false
	}
	return isAllowedInTotal('total')
}

// The last address of X-Forwarded-For is the one the reverse proxy saw, the
// others come from the client. Undefined outside a request.
async function visitorAddress() {
	try {
		const forwardedFor = (await headers()).get('x-forwarded-for')
		return forwardedFor?.split(',').at(-1).trim() || undefined
	} catch {
		return undefined
	}
}

function replyToHeader(email) {
	if (typeof email !== 'string' || email.length > 254 || !REPLY_TO_PATTERN.test(email)) {
		return {}
	}
	return { 'h:Reply-To': email }
}
