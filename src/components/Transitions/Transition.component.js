'use client'

import { ViewTransition } from 'react'

// A boundary adds no DOM wrapper and only animates navigation-related commits.
export function Transition({ children, name }) {
	return (
		<ViewTransition name={name} default="none" enter="fv-enter" exit="fv-exit" update="fv-shared" share="fv-shared">
			{children}
		</ViewTransition>
	)
}
