'use client'

import { ToastContainer } from 'react-toastify'
import { useMemo } from 'react'

import { UserButton, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import { SectionProviderAppComponent } from '@/components/App/SectionProviderApp.component'
import { HeroPatternAppComponent } from '@/components/App/HeroPatternApp.component'
import { NavigationAppComponent } from '@/components/App/NavigationApp.component'
import { HeaderDashboard } from '@/components/App/HeaderApp.component'
import version from '@/helpers/version'

export function LayoutAppComponent({ children }) {
	const { user } = useUser()

	const memoizedImage = useMemo(
		() => (
			<Image
				alt="logo ForVoyez"
				className="h-8 w-auto"
				height={80}
				src="/logo/logo.webp"
				width={80}
			/>
		),
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
						<div className="contents h-full lg:pointer-events-auto lg:flex lg:w-72 lg:flex-col lg:justify-between lg:overflow-y-auto lg:border-r lg:border-slate-900/10 lg:px-6 lg:pb-8 lg:pt-4 xl:w-80">
							<div className={'flex flex-col'}>
								<div className="hidden lg:flex">
									<Link aria-label="Home" href="/app">
										<span className="sr-only">ForVoyez</span>
										{memoizedImage}
									</Link>
								</div>
								<HeaderDashboard />
								<NavigationAppComponent className="hidden h-full lg:mt-10 lg:block" />
							</div>
							<div>
								{user && (
									<div className={'hidden lg:flex lg:items-center lg:gap-2'}>
										<UserButton
											afterSignOutUrl="/"
											appearance="ghost"
											userProfileMode="navigation"
											userProfileUrl="/profile"
										/>
										<Link className={'h-full w-full'} href="/profile">
											<span className="text-sm font-medium text-slate-900">
												{user.firstName} {user.lastName}
											</span>
										</Link>
									</div>
								)}
								<p className="pt-8 text-left text-xs text-slate-500">
									{version}
								</p>
							</div>
						</div>
					</motion.header>
					<div className="relative flex h-full flex-col px-4 pt-14 sm:px-6 lg:px-8 lg:pt-0">
						<main className="flex-auto">
							{memoizedHeroPattern}
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
