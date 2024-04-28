import { UserProfile } from '@clerk/nextjs'

const UserProfilePage = () => (
	<div className={'flex h-full w-screen items-center justify-center lg:p-32 p-4'}>
		<UserProfile path="/profile" routing="path" />
	</div>
)

export default UserProfilePage
