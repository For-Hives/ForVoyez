'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function ClientComponentComponent() {
	const { isLoaded, isSignedIn } = useUser()
	const router = useRouter()

	if (isLoaded && isSignedIn) {
		// Client-side redirection if needed
		// You can use `router.push` here
		router.push('/dashboard')
	}

	return null
}
