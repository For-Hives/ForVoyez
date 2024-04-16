import { SignIn } from '@clerk/nextjs'

export default function Page() {
	return (
		<main className={'flex h-[100dvh] w-[100dvw] items-center justify-center'}>
			<SignIn />
		</main>
	)
}
