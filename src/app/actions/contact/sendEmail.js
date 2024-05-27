'use server'
const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)
const mg = mailgun.client({
	key: process.env.MAILGUN_API_KEY,
	username: 'api',
})

export async function sendEmail(data) {
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
