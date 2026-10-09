import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { getPreviewCode } from '@/components/Playground/GetPreviewCode'
import { RequestCode } from '@/components/Playground/RequestCode.component'

const formData = {
	image: new File(['x'], 'photo.png', { type: 'image/png' }),
	jsonSchema: '{"title":"A short title"}',
	context: 'Une image 漢字',
	languageToTranslate: 'fr',
	keywords: 'image',
}

afterEach(() => cleanup())

describe('lazy syntax highlighting with real Prism', () => {
	it.each(['JavaScript', 'cURL', 'Python', 'PHP', 'HTTP'])(
		'highlights %s without changing the generated request',
		async language => {
			const { container } = render(createElement(RequestCode, { language, formData }))
			await waitFor(() => expect(container.querySelector('.token')).not.toBeNull())
			expect(container.textContent).toBe(getPreviewCode(language, formData))
			const syntax = language === 'cURL' ? 'bash' : language.toLowerCase()
			expect(container.querySelector('code').className).toContain(`language-${syntax}`)
		}
	)

	it('keeps the latest request when the language and form change during loading', async () => {
		const view = render(createElement(RequestCode, { language: 'PHP', formData }))
		const updated = { ...formData, context: 'Updated image' }
		view.rerender(createElement(RequestCode, { language: 'Python', formData: updated }))
		await waitFor(() => expect(view.container.querySelector('.token')).not.toBeNull())
		expect(view.container.textContent).toBe(getPreviewCode('Python', updated))
	})

	it('does not highlight a detached preview after unmounting', async () => {
		const view = render(createElement(RequestCode, { language: 'JavaScript', formData }))
		view.unmount()
		await Promise.resolve()
		expect(screen.queryByText(getPreviewCode('JavaScript', formData))).toBeNull()
	})
})
