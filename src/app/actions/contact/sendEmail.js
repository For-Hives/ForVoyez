'use server'
const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)
const mg = mailgun.client({
	username: 'api',
	key: process.env.MAILGUN_API_KEY,
})

export async function sendEmail(formData) {
	const firstName = formData.get('first-name')
	const lastName = formData.get('last-name')
	const company = formData.get('company')
	const email = formData.get('email')
	const phone = formData.get('phone-number')
	const subject = formData.get('subject')
	const message = formData.get('message')

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

		return { success: true }
	} catch (error) {
		console.error('Error sending email:', error)
		return { success: false }
	}
}
