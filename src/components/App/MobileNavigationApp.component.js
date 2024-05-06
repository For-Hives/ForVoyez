'use client'

import {
	createContext,
	Fragment,
	Suspense,
	useContext,
	useEffect,
	useRef,
} from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { create } from 'zustand'

import { HeaderDashboard } from '@/components/App/HeaderApp.component'
import { NavigationAppComponent } from '@/components/App/NavigationApp.component'

function MenuIcon(props) {
	return (
		<svg
			viewBox="0 0 10 9"
			fill="none"
			strokeLinecap="round"
			aria-hidden="true"
			{...props}
		>
			<path d="M.5 1h9M.5 8h9M.5 4.5h9" />
		</svg>
	)
}

function XIcon(props) {
	return (
		<svg
			viewBox="0 0 10 9"
			fill="none"
			strokeLinecap="round"
			aria-hidden="true"
			{...props}
		>
			<path d="m1.5 1 7 7M8.5 1l-7 7" />
		</svg>
	)
}

const IsInsideMobileNavigationContext = createContext(false)

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
		<Transition.Root show={isOpen} as={Fragment}>
			<Dialog
				onClickCapture={onClickDialog}
				onClose={close}
				className="fixed inset-0 z-50 lg:hidden"
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
					<div className="fixed inset-0 top-14 bg-slate-400/20 backdrop-blur-sm" />
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
							layoutScroll
							className="fixed bottom-0 left-0 top-14 w-full overflow-y-auto bg-white px-4 pb-4 pt-6 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/7.5 min-[416px]:max-w-sm sm:px-6 sm:pb-10"
						>
							<NavigationAppComponent />
						</motion.div>
					</Transition.Child>
				</Dialog.Panel>
			</Dialog>
		</Transition.Root>
	)
}

export function useIsInsideMobileNavigation() {
	return useContext(IsInsideMobileNavigationContext)
}

export const useMobileNavigationStore = create()(set => ({
	isOpen: false,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
	toggle: () => set(state => ({ isOpen: !state.isOpen })),
}))

export function MobileNavigationAppComponent() {
	let isInsideMobileNavigation = useIsInsideMobileNavigation()
	let { isOpen, toggle, close } = useMobileNavigationStore()
	let ToggleIcon = isOpen ? XIcon : MenuIcon

	return (
		<IsInsideMobileNavigationContext.Provider value={true}>
			<button
				type="button"
				className="flex h-6 w-6 items-center justify-center rounded-md transition hover:bg-slate-900/5"
				aria-label="Toggle navigation"
				onClick={toggle}
			>
				<ToggleIcon className="w-2.5 stroke-slate-900" />
			</button>
			{!isInsideMobileNavigation && (
				<Suspense fallback={null}>
					<MobileNavigationDialog isOpen={isOpen} close={close} />
				</Suspense>
			)}
		</IsInsideMobileNavigationContext.Provider>
	)
}
