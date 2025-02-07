'use client'
import { forwardRef, memo } from 'react'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'

import {
	MobileNavigationAppComponent,
	useIsInsideMobileNavigation,
	useMobileNavigationStore,
} from '@/components/App/MobileNavigationApp.component'

export const HeaderDashboard = memo(
	forwardRef(function HeaderDashboard({ className }, ref) {
		let { isOpen: mobileNavIsOpen } = useMobileNavigationStore()
		let isInsideMobileNavigation = useIsInsideMobileNavigation()

		let { scrollY } = useScroll()
		let bgOpacityLight = useTransform(scrollY, [0, 72], [0.5, 0.9])

		return (
			<motion.div
				className={clsx(
					className,
					'fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:left-72 lg:z-30 lg:hidden lg:px-8 xl:left-80',
					!isInsideMobileNavigation && 'backdrop-blur-xs lg:left-72 xl:left-80',
					isInsideMobileNavigation
						? 'bg-white'
						: 'bg-white/[var(--bg-opacity-light)]'
				)}
				ref={ref}
				style={{
					'--bg-opacity-light': bgOpacityLight,
				}}
			>
				<div
					className={clsx(
						'absolute inset-x-0 top-full h-px transition',
						(isInsideMobileNavigation || !mobileNavIsOpen) && 'bg-slate-900/10'
					)}
				/>
				<div className="flex items-center gap-5 lg:hidden">
					<MobileNavigationAppComponent />
					<Link aria-label="Home" href="/app">
						<span className="sr-only">ForVoyez</span>
						<Image
							alt="logo ForVoyez"
							className="h-8 w-auto"
							height={80}
							src="/logo/logo.webp"
							width={80}
						/>
					</Link>
				</div>
			</motion.div>
		)
	})
)
