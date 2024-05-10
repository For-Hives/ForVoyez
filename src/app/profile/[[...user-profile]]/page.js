import { UserProfile } from '@clerk/nextjs'

import { NavbarComponent } from '@/components/Navbar.component'

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
