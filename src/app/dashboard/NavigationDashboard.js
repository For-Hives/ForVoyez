'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'

import { useIsInsideMobileNavigation } from '@/app/dashboard/MobileNavigationDashboard'
import { useSectionStore } from '@/app/dashboard/SectionProviderDashboard'
import { remToPx } from '@/app/dashboard/RemToPxDashboard'
import { TopLevelNavItemDashboard } from '@/app/dashboard/TopLevelNavItemDashboard'
import { UserButton, useUser } from '@clerk/nextjs'

function useInitialValue(value, condition = true) {
	let initialValue = useRef(value).current
	return condition ? initialValue : value
}

function NavLink({ href, children, active = false, isAnchorLink = false }) {
	return (
		<Link
			href={href}
			aria-current={active ? 'page' : undefined}
			className={clsx(
				'flex justify-between gap-2 py-1 pr-3 text-sm transition',
				isAnchorLink ? 'pl-7' : 'pl-4',
				active ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
			)}
		>
			<span className="truncate">{children}</span>
		</Link>
	)
}

function VisibleSectionHighlight({ group, pathname }) {
	let [sections, visibleSections] = useInitialValue(
		[useSectionStore(s => s.sections), useSectionStore(s => s.visibleSections)],
		useIsInsideMobileNavigation()
	)

	let isPresent = useIsPresent()
	let firstVisibleSectionIndex = Math.max(
		0,
		[{ id: '_top' }, ...sections].findIndex(
			section => section.id === visibleSections[0]
		)
	)
	let itemHeight = remToPx(2)
	let height = isPresent
		? Math.max(1, visibleSections.length) * itemHeight
		: itemHeight
	let top =
		group.links.findIndex(link => link.href === pathname) * itemHeight +
		firstVisibleSectionIndex * itemHeight

	return (
		<motion.div
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1, transition: { delay: 0.2 } }}
			exit={{ opacity: 0 }}
			className="absolute inset-x-0 top-0 bg-slate-800/2.5 will-change-transform"
			style={{ borderRadius: 8, height, top }}
		/>
	)
}

function ActivePageMarker({ group, pathname }) {
	let itemHeight = remToPx(2)
	let offset = remToPx(0.25)
	let activePageIndex = group.links.findIndex(link => link.href === pathname)
	let top = offset + activePageIndex * itemHeight

	return (
		<motion.div
			layout
			className="absolute left-2 h-6 w-px bg-forvoyez_orange-500"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1, transition: { delay: 0.2 } }}
			exit={{ opacity: 0 }}
			style={{ top }}
		/>
	)
}

function NavigationGroup({ group, className }) {
	let isInsideMobileNavigation = useIsInsideMobileNavigation()
	let [pathname] = useInitialValue([usePathname()], isInsideMobileNavigation)

	let isActiveGroup =
		group.links.findIndex(link => link.href === pathname) !== -1

	return (
		<li className={clsx('relative mt-6', className)}>
			<motion.h2
				layout="position"
				className="text-xs font-semibold text-slate-900"
			>
				{group.title}
			</motion.h2>
			<div className="relative mt-3 pl-2">
				<AnimatePresence initial={!isInsideMobileNavigation}>
					{isActiveGroup && (
						<VisibleSectionHighlight group={group} pathname={pathname} />
					)}
				</AnimatePresence>
				<motion.div
					layout
					className="absolute inset-y-0 left-2 w-px bg-slate-900/10"
				/>
				<AnimatePresence initial={false}>
					{isActiveGroup && (
						<ActivePageMarker group={group} pathname={pathname} />
					)}
				</AnimatePresence>
				<ul role="list" className="border-l border-transparent">
					{group.links.map(link => (
						<motion.li key={link.href} layout="position" className="relative">
							<NavLink href={link.href} active={link.href === pathname}>
								{link.title}
							</NavLink>
						</motion.li>
					))}
				</ul>
			</div>
		</li>
	)
}

export const dashboardNavigation = [
	{
		title: 'General',
		links: [
			{ title: 'Documentation', href: '/docs' },
			{ title: 'Playground', href: '/playground' },
		],
	},
	{
		title: 'Account',
		links: [
			{ title: 'API Keys', href: '/account/api-keys' },
			{ title: 'Usage', href: '/account/usage' },
			{ title: 'Plans', href: '/account/plans' },
		],
	},
	{
		title: 'Support',
		links: [{ title: 'Help', href: '/support' }],
	},
]

export function NavigationDashboard(props) {
	const { user } = useUser()

	return (
		<nav {...props}>
			<ul role="list">
				<div className={'flex flex-col gap-2 lg:hidden'}>
					<TopLevelNavItemDashboard
						className={'!text-forvoyez_orange-500 lg:hidden'}
						href="/dashboard"
					>
						→ Dashboard
					</TopLevelNavItemDashboard>
					<TopLevelNavItemDashboard
						href="https://forvoyez.fr"
						className={'lg:hidden'}
					>
						Website
					</TopLevelNavItemDashboard>
					<TopLevelNavItemDashboard href="/docs" className={'lg:hidden'}>
						Documentation
					</TopLevelNavItemDashboard>
					<TopLevelNavItemDashboard href="/profile" className={'lg:hidden'}>
						Profile
					</TopLevelNavItemDashboard>
				</div>

				{dashboardNavigation.map((group, groupIndex) => (
					<NavigationGroup
						key={group.title}
						group={group}
						className={groupIndex === 0 ? 'md:mt-0' : ''}
					/>
				))}
				{user && (
					<div className={'mt-6'}>
						<div className={'flex items-center gap-2 lg:hidden'}>
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
					</div>
				)}
			</ul>
		</nav>
	)
}
