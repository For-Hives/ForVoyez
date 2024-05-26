'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ToastContainer } from 'react-toastify'

import { HeaderDashboard } from '@/components/App/HeaderApp.component'
import { HeroPatternAppComponent } from '@/components/App/HeroPatternApp.component'
import { NavigationAppComponent } from '@/components/App/NavigationApp.component'
import { SectionProviderAppComponent } from '@/components/App/SectionProviderApp.component'

export function LayoutAppComponent({ children }) {
	const { user } = useUser()

	return (
		<>
			<ToastContainer position="top-right" autoClose={3000} />

			<SectionProviderAppComponent>
				<div className="h-full lg:ml-72 xl:ml-80">
					<motion.header
						layoutScroll
						className="contents h-full lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex lg:gap-4"
					>
						<div className="contents h-full lg:pointer-events-auto lg:flex lg:w-72 lg:flex-col lg:justify-between lg:overflow-y-auto lg:border-r lg:border-slate-900/10 lg:px-6 lg:pb-8 lg:pt-4 xl:w-80">
							<div className={'flex flex-col'}>
								<div className="hidden lg:flex">
									<Link href="/" aria-label="Home">
										<span className="sr-only">ForVoyez</span>
										<Image
											className="h-8 w-auto"
											src="/logo/logo.webp"
											alt="logo ForVoyez"
											width={80}
											height={80}
										/>
									</Link>
								</div>
								<HeaderDashboard />
								<NavigationAppComponent className="hidden h-full lg:mt-10 lg:block" />
							</div>
							{user && (
								<div className={'hidden lg:flex lg:items-center lg:gap-2'}>
									<UserButton
										appearance="ghost"
										userProfileMode="navigation"
										userProfileUrl="/profile"
										afterSignOutUrl="/"
									/>
									<Link href="/profile" className={'h-full w-full'}>
										<span className="text-sm font-medium text-slate-900">
											{user.firstName} {user.lastName}
										</span>
									</Link>
								</div>
							)}
						</div>
					</motion.header>
					<div className="relative flex h-full flex-col px-4 pt-14 sm:px-6 lg:px-8 lg:pt-0">
						<main className="flex-auto">
							<HeroPatternAppComponent />
							<div className="flex h-full flex-col pb-10 pt-8 xl:pt-16">
								<div className={'z-20'}>{children}</div>
							</div>
						</main>
					</div>
				</div>
			</SectionProviderAppComponent>
		</>
	)
}
