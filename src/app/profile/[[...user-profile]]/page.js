import { UserProfile } from '@clerk/nextjs'

import { NavbarComponent } from '@/components/Navbar.component'

export const metadata = {
	description:
		'Manage your ForVoyez user profile, update personal information, and control your account settings.',
	alternates: {
		canonical: '/profile',
	},
	title: 'User Profile - ForVoyez',
}

const UserProfilePage = () => (
	<div>
		<NavbarComponent />
		<div
			className={
				'flex h-full w-screen items-center justify-center p-4 pt-24 lg:p-32'
			}
		>
			<UserProfile path="/profile" routing="path" />
		</div>
	</div>
)

export default UserProfilePage
