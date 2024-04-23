import Link from 'next/link'
import Image from 'next/image'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

const navigation = [
	{ name: 'Home', href: '/' },
	{ name: 'Features', href: '#features' },
	{ name: 'Pricing', href: '#pricing' },
	{ name: 'Documentation', href: '/doc' },
	{ name: 'Contact', href: '/contact' },
]

export function NavbarComponent() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	return (
		<header className="absolute inset-x-0 top-0 z-50">
			<nav
				className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
				aria-label="Global"
			>
				<div className="flex lg:flex-1">
					<Link href="#" className="-m-1.5 p-1.5">
						<span className="sr-only">ForVoyez</span>
						<Image
							className="h-8 w-auto"
							src="/logo/logo.webp"
							alt=""
							width={80}
							height={80}
						/>
					</Link>
				</div>
				<div className="flex lg:hidden">
					<button
						type="button"
						className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
						onClick={() => setMobileMenuOpen(true)}
					>
						<span className="sr-only">Open main menu</span>
						<Bars3Icon className="h-6 w-6" aria-hidden="true" />
					</button>
				</div>
				<div className="hidden lg:flex lg:gap-x-12">
					{navigation.map(item => (
						<Link
							key={item.name}
							href={item.href}
							className="text-sm font-semibold leading-6 text-gray-900"
						>
							{item.name}
						</Link>
					))}
				</div>
				<div className="hidden lg:flex lg:flex-1 lg:justify-end">
					<SignedIn>
						{/* Mount the UserButton component */}
						<UserButton
							userProfileMode={'navigation'}
							userProfileUrl={'/profile'}
							afterSignOutUrl={'/'}
							signInUrl={'/sign-in'}
						/>
					</SignedIn>
					<SignedOut>
						{/* Signed out users get sign in button */}
						<SignInButton
							className="decoration-none"
							signInFallbackRedirectUrl={'/dashboard'}
							afterSignUpUrl={'/dashboard'}
							afterSignInUrl={'/dashboard'}
						/>
					</SignedOut>
				</div>
			</nav>
			<Dialog
				as="div"
				className="lg:hidden"
				open={mobileMenuOpen}
				onClose={setMobileMenuOpen}
			>
				<div className="fixed inset-0 z-50" />
				<Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
					<div className="flex items-center justify-between">
						<Link href="#" className="-m-1.5 p-1.5">
							<span className="sr-only">Your Company</span>
							<img
								className="h-8 w-auto"
								src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
								alt=""
							/>
						</Link>
						<button
							type="button"
							className="-m-2.5 rounded-md p-2.5 text-gray-700"
							onClick={() => setMobileMenuOpen(false)}
						>
							<span className="sr-only">Close menu</span>
							<XMarkIcon className="h-6 w-6" aria-hidden="true" />
						</button>
					</div>
					<div className="mt-6 flow-root">
						<div className="-my-6 divide-y divide-gray-500/10">
							<div className="space-y-2 py-6">
								{navigation.map(item => (
									<Link
										key={item.name}
										href={item.href}
										className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
									>
										{item.name}
									</Link>
								))}
							</div>
							<div className="py-6">
								<Link
									href="#"
									className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
								>
									Log in
								</Link>
							</div>
						</div>
					</div>
				</Dialog.Panel>
			</Dialog>
		</header>
	)
}
