'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, ViewTransition } from 'react'
import { ToastContainer } from 'react-toastify'
import { createUser } from '@/app/actions/app/createUser'
import { HeaderDashboard } from '@/components/App/HeaderApp.component'
import { HeroPatternAppComponent } from '@/components/App/HeroPatternApp.component'
import { NavigationAppComponent } from '@/components/App/NavigationApp.component'
import { SectionProviderAppComponent } from '@/components/App/SectionProviderApp.component'
import { Transition } from '@/components/Transitions/Transition.component'
import { slug, track } from '@/helpers/analytics'
import version from '@/helpers/version'

const TRACKER_WAIT_MS = 250
const TRACKER_WAIT_ATTEMPTS = 20

// How the account was opened, from the user Clerk already loaded in the
// browser: the provider of a social sign-up ('google'), 'email' otherwise.
function signupMethod(user) {
	return slug(user?.externalAccounts?.[0]?.provider, 30) || 'email'
}

// The server says "created" once per account and never again: on a page loaded
// straight into the dashboard the tracker may still be loading, so give it up
// to 5 s rather than lose the sign-up.
function whenTrackerLoaded(send, attemptsLeft = TRACKER_WAIT_ATTEMPTS) {
	if (window.umami || attemptsLeft <= 0) {
		send()
		return
	}
	setTimeout(() => whenTrackerLoaded(send, attemptsLeft - 1), TRACKER_WAIT_MS)
}

export function LayoutAppComponent({ children }) {
	const { isSignedIn, user } = useUser()
	// the Clerk id never leaves the browser: it only tells two accounts apart
	const signupReportedFor = useRef(null)

	// the database user of the signed-in visitor (the legal pages share this
	// layout and are public: a signed-out visitor has no user to create)
	useEffect(() => {
		if (!isSignedIn) return
		createUser()
			.then(answer => {
				// `created` is true for the one call that inserted the row of the
				// account: its first arrival in the dashboard after signing up. The
				// ref keeps it to one event whatever a second call answers (Strict
				// Mode runs this effect twice in development).
				if (answer?.created !== true || signupReportedFor.current === user?.id) return
				signupReportedFor.current = user?.id
				const method = signupMethod(user)
				whenTrackerLoaded(() => track('auth-signup-complete', { method }))
			})
			.catch(error => console.error('Error creating the user:', error.message))
	}, [isSignedIn])

	const memoizedImage = useMemo(
		() => <Image alt="logo ForVoyez" className="h-8 w-auto" height={80} src="/logo/logo.webp" width={80} />,
		[]
	)

	const memoizedHeroPattern = useMemo(() => <HeroPatternAppComponent />, [])

	return (
		<>
			<ToastContainer autoClose={3000} position="top-right" />

			<SectionProviderAppComponent>
				<div className="h-full lg:ml-72 xl:ml-80">
					<motion.header
						className="contents h-full lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex lg:gap-4"
						layoutScroll
					>
						<div className="contents h-full lg:pointer-events-auto lg:flex lg:w-72 lg:flex-col lg:justify-between lg:overflow-y-auto lg:border-r lg:border-slate-900/10 lg:px-6 lg:pt-4 lg:pb-8 xl:w-80">
							<div className={'flex flex-col'}>
								<div className="hidden lg:flex">
									<Link
										aria-label="Home"
										data-fv-event="dash-nav-click"
										data-fv-event-location="sidebar"
										data-fv-event-target="logo"
										href="/app"
									>
										<span className="sr-only">ForVoyez</span>
										<Transition name="brand-logo">{memoizedImage}</Transition>
									</Link>
								</div>
								<HeaderDashboard />
								<NavigationAppComponent className="hidden h-full lg:mt-10 lg:block" />
							</div>
							<div>
								{user && (
									<div className={'hidden lg:flex lg:items-center lg:gap-2'}>
										<UserButton appearance="ghost" userProfileMode="navigation" userProfileUrl="/profile" />
										<Link
											className={'h-full w-full'}
											data-fv-event="dash-nav-click"
											data-fv-event-location="sidebar"
											data-fv-event-target="profile"
											href="/profile"
										>
											<span className="text-sm font-medium text-slate-900">
												{user.firstName} {user.lastName}
											</span>
										</Link>
									</div>
								)}
								<p className="pt-8 text-left text-xs text-slate-500">{version}</p>
							</div>
						</div>
					</motion.header>
					<div className="relative flex h-full flex-col px-4 pt-14 sm:px-6 lg:px-8 lg:pt-0">
						<main className="flex-auto">
							{memoizedHeroPattern}
							<div className="flex h-full flex-col pt-8 pb-10 xl:pt-16">
								<div className={'z-20'}>
									<ViewTransition default="none" update="fv-page">
										{children}
									</ViewTransition>
								</div>
							</div>
						</main>
					</div>
				</div>
			</SectionProviderAppComponent>
		</>
	)
}
