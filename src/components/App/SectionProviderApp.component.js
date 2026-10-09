'use client'

import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'

import { createStore, useStore } from 'zustand'

import { remToPx } from '@/components/App/RemToPxApp.component'

function createSectionStore(sections) {
	return createStore()(set => ({
		setVisibleSections: visibleSections =>
			set(state => (state.visibleSections.join() === visibleSections.join() ? {} : { visibleSections })),
		visibleSections: [],
		sections,
	}))
}

function useVisibleSections(sectionStore) {
	const setVisibleSections = useStore(sectionStore, s => s.setVisibleSections)
	const sections = useStore(sectionStore, s => s.sections)

	useEffect(() => {
		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Preserve the existing branch order and behavior during the tooling migration.
		function checkVisibleSections() {
			const { innerHeight, scrollY } = window
			const newVisibleSections = []

			for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
				const { offsetRem = 0, headingRef, id } = sections[sectionIndex]

				if (!headingRef?.current) {
					continue
				}

				const offset = remToPx(offsetRem)
				const top = headingRef.current.getBoundingClientRect().top + scrollY

				if (sectionIndex === 0 && top - offset > scrollY) {
					newVisibleSections.push('_top')
				}

				const nextSection = sections[sectionIndex + 1]
				const bottom =
					(nextSection?.headingRef?.current?.getBoundingClientRect().top ?? Infinity) +
					scrollY -
					remToPx(nextSection?.offsetRem ?? 0)

				if (
					(top > scrollY && top < scrollY + innerHeight) ||
					(bottom > scrollY && bottom < scrollY + innerHeight) ||
					(top <= scrollY && bottom >= scrollY + innerHeight)
				) {
					newVisibleSections.push(id)
				}
			}

			setVisibleSections(newVisibleSections)
		}

		const raf = window.requestAnimationFrame(() => checkVisibleSections())
		window.addEventListener('scroll', checkVisibleSections, { passive: true })
		window.addEventListener('resize', checkVisibleSections)

		return () => {
			window.cancelAnimationFrame(raf)
			window.removeEventListener('scroll', checkVisibleSections)
			window.removeEventListener('resize', checkVisibleSections)
		}
	}, [setVisibleSections, sections])
}

const SectionStoreContext = createContext(null)

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function SectionProviderAppComponent({ sections = [], children }) {
	const [sectionStore] = useState(() => createSectionStore(sections))

	useVisibleSections(sectionStore)

	useIsomorphicLayoutEffect(() => {
		if (!sections.length) return
		sectionStore.setState({ sections })
	}, [sectionStore, sections])

	return <SectionStoreContext.Provider value={sectionStore}>{children}</SectionStoreContext.Provider>
}

export function useSectionStore(selector) {
	const store = useContext(SectionStoreContext)
	return useStore(store, selector)
}
