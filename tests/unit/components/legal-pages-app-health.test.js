import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LegalNoticePage from '@/app/(dashboard)/app/legals/legal-notice/page'
import PrivacyPolicyPage from '@/app/(dashboard)/app/legals/privacy-policy/page'
import TermsPage from '@/app/(dashboard)/app/legals/terms/page'

describe('Legal pages markup', () => {
	afterEach(() => {
		cleanup()
		vi.restoreAllMocks()
	})

	// The HTML parser closes a <p> when another block starts inside it: the DOM
	// then differs from what React rendered and hydration fails (React error
	// #418, on every load of the privacy policy until it was fixed).
	it.each([
		['the privacy policy', PrivacyPolicyPage],
		['the terms', TermsPage],
		['the legal notice', LegalNoticePage],
	])('renders %s without invalid HTML nesting', (_name, Page) => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

		const { container } = render(createElement(Page))

		const nestingErrors = consoleError.mock.calls.filter(([message]) =>
			/cannot be a (descendant|child) of|hydration error/.test(String(message))
		)
		expect(nestingErrors).toEqual([])
		expect(container.querySelector('p p')).toBeNull()
	})
})

describe('Privacy policy', () => {
	afterEach(cleanup)

	it('says which interactions Umami measures, and that they carry no identifier', () => {
		const { container } = render(createElement(PrivacyPolicyPage))

		const umamiLine = [...container.querySelectorAll('#service-providers li')].find(
			item => item.querySelector('strong')?.textContent === 'Umami'
		)
		expect(umamiLine.textContent).toContain('cookieless audience measurement, self-hosted')
		expect(umamiLine.textContent).toContain(
			'anonymous interaction events (clicks on buttons and links, form submission outcomes)'
		)
		expect(umamiLine.textContent).toContain('with no cookie and no user or account identifier')
		expect(umamiLine.textContent).toContain('API calls are counted server-side without any such identifier')
	})

	it('keeps the publisher and ForVoyez contact details', () => {
		const { container } = render(createElement(PrivacyPolicyPage))

		expect(container.textContent).toContain('SIRET : 880 505 276 00019')
		expect(screen.getByRole('link', { name: 'https://forvoyez.com/contact' }).getAttribute('href')).toBe(
			'https://forvoyez.com/contact'
		)
		const contactBlock = screen.getByRole('link', { name: 'https://forvoyez.com/contact' }).closest('p')
		expect(contactBlock.textContent).toBe('ForVoyezhttps://forvoyez.com/contact')
	})
})
