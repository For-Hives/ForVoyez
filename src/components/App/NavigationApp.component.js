'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'

import { useIsInsideMobileNavigation } from '@/components/App/MobileNavigationApp.component'
import { remToPx } from '@/components/App/RemToPxApp.component'
import { useSectionStore } from '@/components/App/SectionProviderApp.component'
import { TopLevelNavItemAppComponent } from '@/components/App/TopLevelNavItemApp.component'

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
			{ title: 'Home', href: '/app' },
			{ title: 'Documentation', href: 'https://doc.forvoyez.com/' },
			{ title: 'Playground', href: '/app/playground' },
		],
	},
	{
		title: 'App',
		links: [
			{ title: 'API Keys', href: '/app/tokens' },
			{ title: 'Usage', href: '/app/usage' },
			{ title: 'Plans', href: '/app/plans' },
		],
	},
	{
		title: 'Support',
		links: [
			{ title: 'Help, FAQ & Contact', href: '/contact' },
			{ title: 'Invoice & billing management', href: '/app/billing' },
			{ title: 'Legal Information', href: '/app/legals' },
		],
	},
]

export function NavigationAppComponent(props) {
	const { user } = useUser()

	return (
		<nav {...props}>
			<ul role="list">
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
								<span className="text-sm font-medium text-slate-900">
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
