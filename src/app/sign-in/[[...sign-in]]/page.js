import { SignIn } from '@clerk/nextjs'

import { Suspense } from 'react'

import { NavbarComponent } from '@/components/Navbar.component'

export const metadata = {
	description: 'Sign in to connect your WordPress plugin, manage image generation credits, and view your plan.',
	alternates: {
		canonical: '/sign-in',
	},
	title: 'Sign In - ForVoyez',
}

export default function Page() {
	return (
		<div>
			<NavbarComponent />
			<main className={'flex min-h-[100dvh] w-[100dvw] items-center justify-center p-4 lg:p-32'}>
				<Suspense fallback={<div role="status">Loading account…</div>}>
					<SignIn />
				</Suspense>
			</main>
		</div>
	)
}
