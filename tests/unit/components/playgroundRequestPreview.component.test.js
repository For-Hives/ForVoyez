import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'

import { afterEach, describe, expect, it, vi } from 'vitest'

import PlaygroundPreviewCode from '@/components/Playground/PlaygroundPreviewCode.component'
import { getPreviewCode } from '@/components/Playground/GetPreviewCode'
import { defaultJsonTemplateSchema } from '@/constants/playground'
import copyToClipboard from '@/helpers/copyToClipboard'

vi.mock('@/helpers/copyToClipboard', () => ({ default: vi.fn() }))

const formData = {
	jsonSchema: JSON.stringify(defaultJsonTemplateSchema, null, 4),
	image: new File(['x'], 'photo.png', { type: 'image/png' }),
	languageToTranslate: 'fr',
	keywords: 'cat, sofa',
	context: 'A cat',
}

describe('PlaygroundPreviewCode', () => {
	afterEach(() => {
		cleanup()
		vi.clearAllMocks()
	})

	it.each(['JavaScript', 'cURL', 'Python', 'PHP', 'HTTP'])(
		'shows and copies the %s code of the form',
		language => {
			render(createElement(PlaygroundPreviewCode, { formData }))
			fireEvent.click(screen.getByText('Request Preview'))
			fireEvent.click(screen.getByTestId(`tab-${language.toLowerCase()}`))

			const code = getPreviewCode(language, formData)
			expect(screen.getByText(language).getAttribute('aria-selected')).toBe(
				'true'
			)
			expect(document.querySelector('pre code').textContent).toBe(code)

			// the cURL tab used to throw here: its code element is `language-bash`
			fireEvent.click(screen.getByTestId('copy-button'))
			expect(copyToClipboard).toHaveBeenCalledWith(code)
		}
	)
})
