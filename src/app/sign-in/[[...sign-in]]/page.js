import { SignIn } from '@clerk/nextjs'

import { NavbarComponent } from '@/components/Navbar.component'

export const metadata = {
	description:
		'Sign in to your ForVoyez account to access our advanced image metadata generation API and manage your projects.',
	alternates: {
		canonical: '/sign-in',
	},
	title: 'Sign In - ForVoyez',
}

export default function Page() {
	return (
		<div>
			<NavbarComponent />
			<main
				className={
					'flex min-h-[100dvh] w-[100dvw] items-center justify-center p-4 lg:p-32'
				}
			>
				<SignIn />
			</main>
		</div>
	)
}
