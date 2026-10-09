import { act, cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FeatureAnimation } from '@/components/Landing/Features/FeatureAnimation.component'

vi.mock('next/dynamic', () => ({
	default: () => props => createElement('div', { 'data-testid': 'animation', 'data-autoplay': String(props.autoplay) }),
}))

let notify
let preference
let disconnect

beforeEach(() => {
	preference = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => preference)
	)
	disconnect = vi.fn()
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			constructor(callback) {
				notify = callback
			}
			observe() {}
			disconnect() {
				disconnect()
			}
		}
	)
})
afterEach(() => {
	cleanup()
	vi.unstubAllGlobals()
})

describe('landing animation', () => {
	it('keeps the animation unloaded until it approaches the viewport', () => {
		render(createElement(FeatureAnimation))
		expect(screen.queryByTestId('animation')).toBeNull()
		act(() => notify([{ isIntersecting: false }]))
		expect(screen.queryByTestId('animation')).toBeNull()
		act(() => notify([{ isIntersecting: true }]))
		expect(screen.getByTestId('animation').getAttribute('data-autoplay')).toBe('true')
		expect(disconnect).toHaveBeenCalledTimes(1)
	})

	it('respects reduced motion and removes listeners on unmount', () => {
		preference.matches = true
		const view = render(createElement(FeatureAnimation))
		act(() => notify([{ isIntersecting: true }]))
		expect(screen.getByTestId('animation').getAttribute('data-autoplay')).toBe('false')
		view.unmount()
		expect(preference.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
		expect(disconnect).toHaveBeenCalledTimes(2)
	})

	it('loads without IntersectionObserver on older browsers', () => {
		vi.stubGlobal('IntersectionObserver', undefined)
		render(createElement(FeatureAnimation))
		expect(screen.getByTestId('animation')).toBeTruthy()
	})
})
