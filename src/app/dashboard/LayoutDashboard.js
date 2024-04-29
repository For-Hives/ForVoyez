'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

import { HeaderDashboard } from '@/app/dashboard/HeaderDashoard'
import { NavigationDashboard } from '@/app/dashboard/NavigationDashboard'
import { UserButton, useUser } from '@clerk/nextjs'

export function LayoutDashboard({ children }) {
	let pathname = usePathname()
	const { user } = useUser()

	return (
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
						<NavigationDashboard className="hidden h-full lg:mt-10 lg:block" />
					</div>
					{user && (
						<div className={'flex items-center gap-2'}>
							<UserButton
								appearance="ghost"
								userProfileMode="navigation"
								userProfileUrl="/profile"
								afterSignOutUrl="/"
							/>
							<Link href="/profile" className={'h-full w-full'}>
								<span className="text-sm font-medium text-gray-900">
									{user.firstName} {user.lastName}
								</span>
							</Link>
						</div>
					)}
				</div>
			</motion.header>
			<div className="relative flex h-full flex-col px-4 pt-14 sm:px-6 lg:px-8">
				<main className="flex-auto">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="py-12">
							<h1 className="text-4xl font-bold tracking-tight text-gray-900">
								Welcome to the ForVoyez Developer Platform
							</h1>
							<div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
								<div className="group relative">
									<div className="mt-4 flex justify-between">
										<div>
											<h3 className="text-sm text-gray-700">
												<Link href="#">
													<span
														aria-hidden="true"
														className="absolute inset-0"
													/>
													Start with the Basics
												</Link>
											</h3>
											<p className="mt-1 text-sm text-gray-500">
												Online tools and resources to get you started.
											</p>
										</div>
									</div>
								</div>
								<div className="group relative">
									<div className="mt-4 flex justify-between">
										<div>
											<h3 className="text-sm text-gray-700">
												<Link href="#">
													<span
														aria-hidden="true"
														className="absolute inset-0"
													/>
													Documentation
												</Link>
											</h3>
											<p className="mt-1 text-sm text-gray-500">
												Discover our features and API reference.
											</p>
										</div>
									</div>
								</div>
							</div>
							<div className="mt-12">
								<h2 className="text-2xl font-bold tracking-tight text-gray-900">
									Configuration
								</h2>
								<div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
									<div className="group relative">
										<div className="mt-4 flex justify-between">
											<div>
												<h3 className="text-sm text-gray-700">
													<Link href="#">
														<span
															aria-hidden="true"
															className="absolute inset-0"
														/>
														Playground
													</Link>
												</h3>
												<p className="mt-1 text-sm text-gray-500">
													Explore and test our API endpoints.
												</p>
											</div>
										</div>
									</div>
									<div className="group relative">
										<div className="mt-4 flex justify-between">
											<div>
												<h3 className="text-sm text-gray-700">
													<Link href="#">
														<span
															aria-hidden="true"
															className="absolute inset-0"
														/>
														API Keys
													</Link>
												</h3>
												<p className="mt-1 text-sm text-gray-500">
													Manage your API keys and authentication.
												</p>
											</div>
										</div>
									</div>
									<div className="group relative">
										<div className="mt-4 flex justify-between">
											<div>
												<h3 className="text-sm text-gray-700">
													<Link href="#">
														<span
															aria-hidden="true"
															className="absolute inset-0"
														/>
														Usage
													</Link>
												</h3>
												<p className="mt-1 text-sm text-gray-500">
													Track your API usage and limits.
												</p>
											</div>
										</div>
									</div>
									<div className="group relative">
										<div className="mt-4 flex justify-between">
											<div>
												<h3 className="text-sm text-gray-700">
													<Link href="#">
														<span
															aria-hidden="true"
															className="absolute inset-0"
														/>
														Plans
													</Link>
												</h3>
												<p className="mt-1 text-sm text-gray-500">
													Upgrade or change your subscription plan.
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}
