import { SignUp } from '@clerk/nextjs'

import { NavbarComponent } from '@/components/Navbar.component'

export const metadata = {
	description:
		'Create your ForVoyez account to start generating SEO-optimized image metadata using our AI-powered API.',
	alternates: {
		canonical: '/sign-up',
	},
	title: 'Sign Up - ForVoyez',
}

export default function Page() {
	return (
		<div>
			<NavbarComponent />
			<main
				className={
					'flex min-h-[100dvh] w-[100dvw] items-center justify-center p-4 pt-20 lg:p-32'
				}
			>
				<SignUp />
			</main>
		</div>
	)
}
