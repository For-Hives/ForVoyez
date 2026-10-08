import { act, cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
	getMyCredits,
	getMyUsage,
	getMyUsageByToken,
} from '@/app/actions/app/usage'
import { UsageChartComponent } from '@/components/usage/usageChart.component'
import { Playground } from '@/components/Playground/Playground.component'

vi.mock('@clerk/nextjs', () => ({ useAuth: () => ({ userId: 'user123' }) }))
vi.mock('@/app/actions/app/usage', () => ({
	getMyUsageByToken: vi.fn(),
	getMyCredits: vi.fn(),
	getMyUsage: vi.fn(),
}))
vi.mock('@/app/actions/app/playground', () => ({
	describePlaygroundAction: vi.fn(),
}))
vi.mock('@/components/Playground/PlaygroundPreviewCode.component', () => ({
	default: () => null,
}))
vi.mock('@/components/Playground/PlaygroundResponse.component', () => ({
	default: () => null,
}))
vi.mock('@/components/Playground/PlaygroundForm.component', () => ({
	default: () => null,
}))
// jsdom has no layout: render the chart containers only
vi.mock('recharts', () => {
	const Container = props =>
		createElement('div', { 'data-testid': props['data-testid'] })
	const Empty = () => null
	return {
		ResponsiveContainer: Container,
		CartesianGrid: Empty,
		AreaChart: Empty,
		BarChart: Empty,
		Tooltip: Empty,
		Legend: Empty,
		XAxis: Empty,
		YAxis: Empty,
		Area: Empty,
		Bar: Empty,
	}
})

// A promise the test settles by hand, to look at the page while it loads.
function deferred() {
	let settle
	const promise = new Promise(resolve => {
		settle = resolve
	})
	return { resolve: settle, promise }
}

const USAGE_DOWN_TO_ZERO = [
	{
		fullDate: new Date('2026-10-01T09:20:00.000Z'),
		dateHour: '2026-10-01T09',
		creditsLeft: 1,
	},
	{
		fullDate: new Date('2026-10-02T14:30:00.000Z'),
		dateHour: '2026-10-02T14',
		creditsLeft: 0,
	},
]

describe('UsageChartComponent', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	afterEach(() => {
		cleanup()
	})

	it('should show a placeholder, not 0, until the credits are loaded', async () => {
		const credits = deferred()
		getMyCredits.mockReturnValue(credits.promise)
		getMyUsage.mockReturnValue(new Promise(() => {}))
		getMyUsageByToken.mockReturnValue(new Promise(() => {}))

		render(createElement(UsageChartComponent))

		expect(screen.getByTestId('user-credits-loading')).toBeTruthy()
		expect(screen.queryByText(/You have 0 credits left/)).toBeNull()
		// nor the "never used" banner while the history is loading
		expect(screen.queryByTestId('usage-tooltip')).toBeNull()
		expect(screen.queryByTestId('no-usage-data')).toBeNull()
		expect(screen.queryByTestId('no-usage-summary')).toBeNull()

		await act(async () => credits.resolve(0))

		expect(screen.queryByTestId('user-credits-loading')).toBeNull()
		expect(screen.getByText(/You have/).textContent).toBe(
			'You have 0 credits left'
		)
	})

	it('should show the history of a user at 0 credits', async () => {
		getMyCredits.mockResolvedValue(0)
		getMyUsage.mockResolvedValue(USAGE_DOWN_TO_ZERO)
		getMyUsageByToken.mockResolvedValue([{ token: 'Playground', used: 2 }])

		render(createElement(UsageChartComponent))

		expect(await screen.findByTestId('usage-chart')).toBeTruthy()
		expect(screen.getByTestId('usage-by-token-chart')).toBeTruthy()
		expect(screen.queryByTestId('no-usage-data')).toBeNull()
		expect(screen.queryByTestId('no-usage-summary')).toBeNull()
		expect(screen.queryByTestId('usage-tooltip')).toBeNull()
		expect(
			screen.getByText('Follow your remaining credits over time:').nextSibling
				.textContent
		).toBe('0 credits left')
	})

	it('should show the real balance next to the chart, not its last point', async () => {
		// two overlapping API calls stored in the reverse order: the last point
		// (1) is one step behind the balance (0)
		getMyCredits.mockResolvedValue(0)
		getMyUsage.mockResolvedValue([{ ...USAGE_DOWN_TO_ZERO[1], creditsLeft: 1 }])
		getMyUsageByToken.mockResolvedValue([])

		render(createElement(UsageChartComponent))

		expect(await screen.findByTestId('usage-chart')).toBeTruthy()
		expect(
			screen.getByText('Follow your remaining credits over time:').nextSibling
				.textContent
		).toBe('0 credits left')
	})

	it('should show the "never used" banner only once both charts answered empty', async () => {
		const usage = deferred()
		getMyCredits.mockResolvedValue(0)
		getMyUsage.mockReturnValue(usage.promise)
		getMyUsageByToken.mockResolvedValue([])

		render(createElement(UsageChartComponent))
		await act(async () => {})

		expect(screen.queryByTestId('usage-tooltip')).toBeNull()

		await act(async () => usage.resolve([]))

		expect(screen.getByTestId('usage-tooltip')).toBeTruthy()
		expect(screen.getByTestId('no-usage-summary').textContent).toBe(
			'No usage yet'
		)
		// one element only: the e2e specs wait for it in Playwright strict mode
		expect(screen.getAllByTestId('no-usage-data')).toHaveLength(1)
		expect(screen.getByTestId('no-usage-data').textContent).toBe(
			'No usage data available.'
		)
	})

	it('should call each server action once', async () => {
		getMyCredits.mockResolvedValue(3)
		getMyUsage.mockResolvedValue([])
		getMyUsageByToken.mockResolvedValue([])

		render(createElement(UsageChartComponent))
		await act(async () => {})

		expect(getMyCredits).toHaveBeenCalledTimes(1)
		expect(getMyUsage).toHaveBeenCalledTimes(1)
		expect(getMyUsageByToken).toHaveBeenCalledTimes(1)
	})

	it('should still show the history when the credits request fails', async () => {
		getMyCredits.mockRejectedValue(new Error('network'))
		getMyUsage.mockResolvedValue(USAGE_DOWN_TO_ZERO)
		getMyUsageByToken.mockResolvedValue([])
		vi.spyOn(console, 'error').mockImplementation(() => {})

		render(createElement(UsageChartComponent))

		expect(await screen.findByTestId('usage-chart')).toBeTruthy()
		expect(screen.getByTestId('user-credits-loading')).toBeTruthy()
		expect(screen.queryByText(/You have 0 credits left/)).toBeNull()
	})
})

describe('Playground credits', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	afterEach(() => {
		cleanup()
	})

	it('should show a placeholder, not 0, until the credits are loaded', async () => {
		const credits = deferred()
		getMyCredits.mockReturnValue(credits.promise)

		render(createElement(Playground))

		expect(screen.getByTestId('user-credits-loading')).toBeTruthy()
		expect(screen.queryByTestId('user-credits')).toBeNull()
		expect(screen.queryByTestId('tooltip')).toBeNull()

		await act(async () => credits.resolve(0))

		expect(screen.queryByTestId('user-credits-loading')).toBeNull()
		expect(screen.getByTestId('user-credits').textContent).toBe('0')
		expect(screen.getByTestId('tooltip')).toBeTruthy()
	})
})
