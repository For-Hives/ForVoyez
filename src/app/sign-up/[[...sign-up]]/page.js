import { SignUp } from '@clerk/nextjs'

import { Suspense } from 'react'

import { NavbarComponent } from '@/components/Navbar.component'

export const metadata = {
	description: 'Create your ForVoyez account to generate alt text, titles, and captions with the WordPress plugin.',
	alternates: {
		canonical: '/sign-up',
	},
	title: 'Sign Up - ForVoyez',
}

export default function Page() {
	return (
		<div>
			<NavbarComponent />
			<main className={'flex min-h-[100dvh] w-[100dvw] items-center justify-center p-4 pt-20 lg:p-32'}>
				<Suspense fallback={<div role="status">Loading account…</div>}>
					<SignUp />
				</Suspense>
			</main>
		</div>
	)
}
