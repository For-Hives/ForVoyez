'use client'

import { useEffect, useRef } from 'react'
import { getPreviewCode } from '@/components/Playground/GetPreviewCode'

/** Load syntax highlighting only when an actual request preview is mounted. */
export function RequestCode({ language, formData }) {
	const element = useRef(null)
	const code = getPreviewCode(language, formData)
	const syntax = language.toLowerCase() === 'curl' ? 'bash' : language.toLowerCase()

	useEffect(() => {
		let active = true
		import('@/helpers/highlightCode')
			.then(({ highlightCode }) => {
				if (active && element.current) highlightCode(element.current)
			})
			.catch(error => console.error('Failed to load syntax highlighting:', error))
		return () => {
			active = false
		}
	}, [code, syntax])

	return (
		<code className={`language-${syntax}`} ref={element}>
			{code}
		</code>
	)
}
