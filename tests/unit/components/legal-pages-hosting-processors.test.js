import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import LegalNoticePage from '@/app/(dashboard)/app/legals/legal-notice/page'
import PrivacyPolicyPage from '@/app/(dashboard)/app/legals/privacy-policy/page'

// Every provider that receives personal data has to be named in the policy
const SERVICE_PROVIDERS = ['netcup GmbH', 'Contabo GmbH', 'OpenAI', 'Clerk', 'Lemon Squeezy', 'Mailgun', 'OVH', 'Umami']

describe('Legal notice', () => {
	afterEach(cleanup)

	it('names netcup as the host with its address and phone (LCEN)', () => {
		const { container } = render(createElement(LegalNoticePage))

		const hostLine = screen.getByText('Hosted by').parentElement.textContent
		expect(hostLine).toContain(
			'Hosted by: netcup GmbH, Emmy-Noether-Straße 10, 76131 Karlsruhe, Germany, +49 721 7540755-0'
		)
		expect(container.textContent).not.toContain('Aschauer Straße')
	})

	it('keeps the publisher details unchanged', () => {
		const { container } = render(createElement(LegalNoticePage))

		expect(container.textContent).toContain('SIRET: 880 505 276 00019')
		expect(container.textContent).toContain('VAT number: FR 35 880505276')
	})

	it('links to the list of service providers', () => {
		render(createElement(LegalNoticePage))

		const link = screen.getByRole('link', { name: 'Privacy Policy' })
		expect(link.getAttribute('href')).toBe('/app/legals/privacy-policy#service-providers')
	})
})

describe('Privacy policy', () => {
	afterEach(cleanup)

	it('lists every service provider in the linked section', () => {
		const { container } = render(createElement(PrivacyPolicyPage))

		const section = container.querySelector('#service-providers')
		expect(section).not.toBeNull()
		const names = [...section.querySelectorAll('li > strong')].map(strong => strong.textContent)
		expect(names).toEqual(SERVICE_PROVIDERS)
	})

	it('no longer publishes the bank details of a hosting provider', () => {
		const { container } = render(createElement(PrivacyPolicyPage))

		expect(container.textContent).not.toMatch(/IBAN|BIC|Hypo-Vereinsbank/)
	})

	it('no longer claims a phone number is collected at sign-up', () => {
		const { container } = render(createElement(PrivacyPolicyPage))

		expect(container.textContent).not.toContain('phone number, and email')
	})
})
