'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useRef } from 'react'

import { useIsInsideMobileNavigation } from '@/components/App/MobileNavigationApp.component'
import { remToPx } from '@/components/App/RemToPxApp.component'
import { useSectionStore } from '@/components/App/SectionProviderApp.component'

function ActivePageMarker({ pathname, group }) {
	const itemHeight = remToPx(2)
	const offset = remToPx(0.25)
	const activePageIndex = group.links.findIndex(link => link.href === pathname)
	const top = offset + activePageIndex * itemHeight

	return (
		<motion.div
			animate={{ transition: { delay: 0.2 }, opacity: 1 }}
			className="bg-forvoyez_orange-500 absolute left-2 h-6 w-px"
			exit={{ opacity: 0 }}
			initial={{ opacity: 0 }}
			layout
			style={{ top }}
		/>
	)
}

function NavigationGroup({ className, group }) {
	const isInsideMobileNavigation = useIsInsideMobileNavigation()
	const [pathname] = useInitialValue([usePathname()], isInsideMobileNavigation)

	const isActiveGroup = group.links.findIndex(link => link.href === pathname) !== -1

	return (
		<li className={clsx('relative mt-6', className)}>
			<motion.h2 className="text-xs font-semibold text-slate-900" layout="position">
				{group.title}
			</motion.h2>
			<div className="relative mt-3 pl-2">
				<AnimatePresence initial={!isInsideMobileNavigation}>
					{isActiveGroup && <VisibleSectionHighlight group={group} pathname={pathname} />}
				</AnimatePresence>
				<motion.div className="absolute inset-y-0 left-2 w-px bg-slate-900/10" layout />
				<AnimatePresence initial={false}>
					{isActiveGroup && <ActivePageMarker group={group} pathname={pathname} />}
				</AnimatePresence>
				<ul className="border-l border-transparent">
					{group.links.map(link => (
						<motion.li className="relative" key={link.href} layout="position">
							<NavLink active={link.href === pathname} href={link.href} testId={link.testId}>
								{link.title}
							</NavLink>
						</motion.li>
					))}
				</ul>
			</div>
		</li>
	)
}

function NavLink({ isAnchorLink = false, active = false, children, testId, href }) {
	return (
		<Link
			aria-current={active ? 'page' : undefined}
			className={clsx(
				'flex justify-between gap-2 py-1 pr-3 text-sm transition',
				isAnchorLink ? 'pl-7' : 'pl-4',
				active ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
			)}
			data-testid={testId}
			href={href}
		>
			<span className="truncate">{children}</span>
		</Link>
	)
}

function useInitialValue(value, condition = true) {
	const initialValue = useRef(value).current
	return condition ? initialValue : value
}

function VisibleSectionHighlight({ pathname, group }) {
	const [sections, visibleSections] = useInitialValue(
		[useSectionStore(s => s.sections), useSectionStore(s => s.visibleSections)],
		useIsInsideMobileNavigation()
	)

	const isPresent = useIsPresent()
	const firstVisibleSectionIndex = Math.max(
		0,
		[{ id: '_top' }, ...sections].findIndex(section => section.id === visibleSections[0])
	)
	const itemHeight = remToPx(2)
	const height = isPresent ? Math.max(1, visibleSections.length) * itemHeight : itemHeight
	const top = group.links.findIndex(link => link.href === pathname) * itemHeight + firstVisibleSectionIndex * itemHeight

	return (
		<motion.div
			animate={{ transition: { delay: 0.2 }, opacity: 1 }}
			className="absolute inset-x-0 top-0 bg-slate-800/2.5 will-change-transform"
			exit={{ opacity: 0 }}
			initial={{ opacity: 0 }}
			layout
			style={{ borderRadius: 8, height, top }}
		/>
	)
}

export const dashboardNavigation = [
	{
		links: [
			{ testId: 'nav-link-home', title: 'Home', href: '/app' },
			{
				href: 'https://doc.forvoyez.com/',
				testId: 'nav-link-documentation',
				title: 'Documentation',
			},
			{
				testId: 'nav-link-playground',
				href: '/app/playground',
				title: 'Playground',
			},
		],
		title: 'General',
	},
	{
		links: [
			{ testId: 'nav-link-api-keys', href: '/app/tokens', title: 'API Keys' },
			{ testId: 'nav-link-usage', href: '/app/usage', title: 'Usage' },
			{ testId: 'nav-link-plans', href: '/app/plans', title: 'Plans' },
		],
		title: 'App',
	},
	{
		links: [
			{
				title: 'Help, FAQ & Contact',
				testId: 'nav-link-help',
				href: '/contact',
			},
			{
				title: 'Invoice & billing management',
				testId: 'nav-link-billing',
				href: '/app/billing',
			},
			{
				title: 'Legal Information',
				testId: 'nav-link-legals',
				href: '/app/legals',
			},
		],
		title: 'Support',
	},
]

export const NavigationAppComponent = memo(function NavigationAppComponent(props) {
	const { user } = useUser()

	return (
		<nav {...props}>
			<ul>
				{dashboardNavigation.map((group, groupIndex) => (
					<NavigationGroup className={groupIndex === 0 ? 'md:mt-0' : ''} group={group} key={group.title} />
				))}
				{user && (
					<div className={'mt-6'}>
						<div className={'flex items-center gap-2 lg:hidden'}>
							<UserButton appearance="ghost" userProfileMode="navigation" userProfileUrl="/profile" />
							<Link className={'h-full w-full'} href="/profile">
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
})
