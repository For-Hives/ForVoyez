import { SignIn } from '@clerk/nextjs'
import { NavbarComponent } from '@/components/Navbar.component'

export default function Page() {
	return (
		<div>
			<NavbarComponent />
			<main
				className={
					'flex h-[100dvh] w-[100dvw] items-center justify-center p-4 lg:p-32'
				}
			>
				<SignIn />
			</main>
		</div>
	)
}
