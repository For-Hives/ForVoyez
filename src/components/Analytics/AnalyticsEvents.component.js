'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { setSignedIn, trackClick } from '@/helpers/analytics'

// Mounted once in the root layout. A click on, or inside, an element whose
// data-fv-event attribute names an event sends it to Umami, with the element's
// data-fv-event-<key> attributes as properties: server components and links
// only need attributes.
//
// Umami's own data-umami-event is not used: on a link, its tracker cancels the
// click and sets location.href itself once its request is done, which turns a
// next/link navigation into a full page load.
//
// The clicks of a Headless UI dialog never get here: see trackClick.
export function AnalyticsEventsComponent() {
	const { isLoaded, isSignedIn } = useAuth()

	useEffect(() => {
		setSignedIn(isLoaded ? Boolean(isSignedIn) : undefined)
	}, [isLoaded, isSignedIn])

	useEffect(() => {
		// bubble phase and no preventDefault: the click keeps doing what it did
		document.addEventListener('click', trackClick)
		return () => document.removeEventListener('click', trackClick)
	}, [])

	return null
}
