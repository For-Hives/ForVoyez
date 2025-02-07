'use client'

import {
	createContext,
	Fragment,
	memo,
	Suspense,
	useContext,
	useEffect,
	useRef,
} from 'react'
import { Dialog, Transition } from '@headlessui/react'

import { usePathname, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { create } from 'zustand'

import { NavigationAppComponent } from '@/components/App/NavigationApp.component'
import { HeaderDashboard } from '@/components/App/HeaderApp.component'

function MenuIcon(props) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			strokeLinecap="round"
			viewBox="0 0 10 9"
			{...props}
		>
			<path d="M.5 1h9M.5 8h9M.5 4.5h9" />
		</svg>
	)
}

function XIcon(props) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			strokeLinecap="round"
			viewBox="0 0 10 9"
			{...props}
		>
			<path d="m1.5 1 7 7M8.5 1l-7 7" />
		</svg>
	)
}

const IsInsideMobileNavigationContext = createContext(false)

export function useIsInsideMobileNavigation() {
	return useContext(IsInsideMobileNavigationContext)
}

function MobileNavigationDialog({ isOpen, close }) {
	let pathname = usePathname()
	let searchParams = useSearchParams()
	let initialPathname = useRef(pathname).current
	let initialSearchParams = useRef(searchParams).current

	useEffect(() => {
		if (pathname !== initialPathname || searchParams !== initialSearchParams) {
			close()
		}
	}, [pathname, searchParams, close, initialPathname, initialSearchParams])

	function onClickDialog(event) {
		if (!(event.target instanceof HTMLElement)) {
			return
		}

		let link = event.target.closest('a')
		if (
			link &&
			link.pathname + link.search + link.hash ===
				window.location.pathname + window.location.search + window.location.hash
		) {
			close()
		}
	}

	return (
		<Transition.Root as={Fragment} show={isOpen}>
			<Dialog
				className="fixed inset-0 z-50 lg:hidden"
				onClickCapture={onClickDialog}
				onClose={close}
			>
				<Transition.Child
					as={Fragment}
					enter="duration-300 ease-out"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="duration-200 ease-in"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 top-14 bg-slate-400/20 backdrop-blur-xs" />
				</Transition.Child>

				<Dialog.Panel>
					<Transition.Child
						as={Fragment}
						enter="duration-300 ease-out"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="duration-200 ease-in"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<HeaderDashboard />
					</Transition.Child>

					<Transition.Child
						as={Fragment}
						enter="duration-500 ease-in-out"
						enterFrom="-translate-x-full"
						enterTo="translate-x-0"
						leave="duration-500 ease-in-out"
						leaveFrom="translate-x-0"
						leaveTo="-translate-x-full"
					>
						<motion.div
							className="fixed top-14 bottom-0 left-0 w-full overflow-y-auto bg-white px-4 pt-6 pb-4 ring-1 shadow-lg shadow-slate-900/10 ring-slate-900/7.5 min-[416px]:max-w-sm sm:px-6 sm:pb-10"
							layoutScroll
						>
							<NavigationAppComponent />
						</motion.div>
					</Transition.Child>
				</Dialog.Panel>
			</Dialog>
		</Transition.Root>
	)
}

export const useMobileNavigationStore = create()(set => ({
	toggle: () => set(state => ({ isOpen: !state.isOpen })),
	close: () => set({ isOpen: false }),
	open: () => set({ isOpen: true }),
	isOpen: false,
}))

export const MobileNavigationAppComponent = memo(
	function MobileNavigationAppComponent() {
		// Wrap with memo
		let isInsideMobileNavigation = useIsInsideMobileNavigation()
		let { isOpen, toggle, close } = useMobileNavigationStore()
		let ToggleIcon = isOpen ? XIcon : MenuIcon

		return (
			<IsInsideMobileNavigationContext.Provider value={true}>
				<button
					aria-label="Toggle navigation"
					className="flex h-6 w-6 items-center justify-center rounded-md transition hover:bg-slate-900/5"
					onClick={toggle}
					type="button"
				>
					<ToggleIcon className="w-2.5 stroke-slate-900" />
				</button>
				{!isInsideMobileNavigation && (
					<Suspense fallback={null}>
						<MobileNavigationDialog close={close} isOpen={isOpen} />
					</Suspense>
				)}
			</IsInsideMobileNavigationContext.Provider>
		)
	}
)
