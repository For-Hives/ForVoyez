'use server'
const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)
const mg = mailgun.client({
	username: 'api',
	key: process.env.MAILGUN_API_KEY,
})

export async function sendEmail(data) {
	const {
		'first-name': firstName,
		'last-name': lastName,
		company,
		email,
		'phone-number': phone,
		subject,
		message,
	} = data

	try {
		await mg.messages.create(process.env.MAILGUN_DOMAIN, {
			from: 'ForVoyez <noreply@forvoyez.fr>',
			to: 'contact@forvoyez.fr',
			subject: `New contact message - ${subject}`,
			text: `
        Prénom: ${firstName}
        Nom: ${lastName}
        Entreprise: ${company}
        Email: ${email}
        Téléphone: ${phone}
        
        Message:
        ${message}`,
		})

		return { success: true, status: 200 }
	} catch (error) {
		return {
			success: false,
			error: error.message,
			status: error.status,
			details:
				'An error occurred while sending the email. Please try again later. If the problem persists, please contact the website administrator. ' +
				'(through contact@forvoyez.fr)',
		}
	}
}
