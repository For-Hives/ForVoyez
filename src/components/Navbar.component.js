'use client'

import { useState } from 'react'

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { ArrowUpRightIcon } from '@heroicons/react/20/solid'
import { Dialog } from '@headlessui/react'
import Image from 'next/image'
import Link from 'next/link'

const navigation = [
	{ testId: 'nav-home', name: 'Home', href: '/' },
	{ testId: 'nav-features', href: '/#features', name: 'Features' },
	{ testId: 'nav-pricing', href: '/#pricing', name: 'Pricing' },
	{
		href: 'https://doc.forvoyez.com/',
		name: 'Documentation',
		testId: 'nav-docs',
	},
	{ testId: 'nav-contact', href: '/contact', name: 'Contact' },
]

export function NavbarComponent() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<header className="absolute inset-x-0 top-0 z-50">
			<nav
				aria-label="Global"
				className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
			>
				<div className="flex lg:flex-1">
					<Link className="-m-1.5 p-1.5" data-testid="logo-link" href="/">
						<span className="sr-only">ForVoyez</span>
						<Image
							alt=""
							className="h-8 w-auto"
							data-testid="logo-image"
							height={80}
							src="/logo/logo.webp"
							width={80}
						/>
					</Link>
				</div>
				<div className="flex lg:hidden">
					<button
						className={
							'-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 ' +
							`text-slate-700 ${mobileMenuOpen ? 'hidden' : 'block'}`
						}
						data-testid="menu-open-button"
						onClick={() => setMobileMenuOpen(true)}
						type="button"
					>
						<span className="sr-only">Open main menu</span>
						<Bars3Icon aria-hidden="true" className="h-6 w-6" />
					</button>
				</div>
				<div className="hidden lg:flex lg:gap-x-12">
					{navigation.map(item => (
						<Link
							className="text-sm font-semibold leading-6 text-slate-900"
							data-testid={`nav-${item.name.toLowerCase()}`}
							href={item.href}
							key={item.name}
						>
							{item.name}
						</Link>
					))}
				</div>
				<div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-4">
					<SignedIn>
						{/* Mount the UserButton component */}
						<UserButton
							afterSignOutUrl={'/'}
							data-testid="user-button"
							signInUrl={'/sign-in'}
							userProfileMode={'navigation'}
							userProfileUrl={'/profile'}
						/>
						<Link
							className="z-40 flex rounded-md text-sm text-slate-950 underline transition-all"
							data-testid="dashboard-link"
							href="/app"
						>
							Go to dashboard{' '}
							<ArrowUpRightIcon className={'size-3.5'}></ArrowUpRightIcon>
						</Link>
					</SignedIn>
					<SignedOut>
						{/* Signed out users get sign in button */}
						<SignInButton
							afterSignInUrl={'/app'}
							afterSignUpUrl={'/app'}
							className="decoration-none"
							data-testid="sign-in-button"
							signInFallbackRedirectUrl={'/app'}
						/>
					</SignedOut>
				</div>
			</nav>
			<Dialog
				as="div"
				className="lg:hidden"
				onClose={setMobileMenuOpen}
				open={mobileMenuOpen}
			>
				<div className="fixed inset-0 z-50" />
				<Dialog.Panel
					className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-slate-900/10"
					data-testid="mobile-menu-dialog"
				>
					<div className="flex items-center justify-between">
						<Link className="-m-1.5 p-1.5" href="/">
							<span className="sr-only">ForVoyez</span>
							<Image
								alt="Logo ForVoyez"
								className="h-8 w-auto"
								data-testid="logo-image"
								height={80}
								src="/logo/logo.webp"
								width={80}
							/>
						</Link>
						<button
							className={`-m-2.5 rounded-md p-2.5 text-slate-700 ${mobileMenuOpen ? 'block' : 'hidden'}`}
							data-testid="menu-close-button"
							onClick={() => setMobileMenuOpen(false)}
							type="button"
						>
							<span className="sr-only">Close menu</span>
							<XMarkIcon aria-hidden="true" className="h-6 w-6" />
						</button>
					</div>
					<div className="mt-6 flow-root">
						<div className="-my-6 divide-y divide-slate-500/10">
							<div className="space-y-2 py-6">
								{navigation.map(item => (
									<Link
										className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50"
										data-testid={`${item.testId.toLowerCase()}`}
										href={item.href}
										key={item.name}
									>
										{item.name}
									</Link>
								))}
							</div>
							<div className="py-6">
								<SignedIn>
									{/* Mount the UserButton component */}
									<div className={'flex flex-col gap-4'}>
										<Link
											className="z-40 flex rounded-md text-sm text-slate-950 underline transition-all"
											data-testid="dashboard-link"
											href="/app"
										>
											Go to dashboard{' '}
											<ArrowUpRightIcon
												className={'size-3.5'}
											></ArrowUpRightIcon>
										</Link>
										<UserButton
											afterSignOutUrl={'/'}
											data-testid="user-button"
											signInUrl={'/sign-in'}
											userProfileMode={'navigation'}
											userProfileUrl={'/profile'}
										/>
									</div>
								</SignedIn>
								<SignedOut>
									{/* Signed out users get sign in button */}
									<SignInButton
										className="decoration-none -mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50"
										data-testid="sign-in-button"
									/>
								</SignedOut>
							</div>
						</div>
					</div>
				</Dialog.Panel>
			</Dialog>
		</header>
	)
}
