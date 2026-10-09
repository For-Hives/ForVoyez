'use server'
const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)
const mg = mailgun.client({
	key: process.env.MAILGUN_API_KEY,
	username: 'api',
})

// one address, no whitespace (so no header folding) and no list separators
const REPLY_TO_PATTERN = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/

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
			subject: `New contact message - ${subject}`,
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
			error: error.message,
			status: error.status,
			success: false,
		}
	}
}

function replyToHeader(email) {
	if (typeof email !== 'string' || email.length > 254 || !REPLY_TO_PATTERN.test(email)) {
		return {}
	}
	return { 'h:Reply-To': email }
}
