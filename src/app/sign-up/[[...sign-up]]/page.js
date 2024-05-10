import { SignUp } from '@clerk/nextjs'

import { NavbarComponent } from '@/components/Navbar.component'

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
