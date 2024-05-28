import { describe, expect, it } from 'vitest'

import { sortPlans } from '@/helpers/sortPlans'

describe('sortPlans', () => {
	it('should sort plans by the numbers in their names', () => {
		const plans = [
			{ name: 'Plan 10' },
			{ name: 'Plan 2' },
			{ name: 'Plan 30' },
			{ name: 'Plan 1' },
		]

		const sortedPlans = sortPlans(plans)

		expect(sortedPlans).toEqual([
			{ name: 'Plan 1' },
			{ name: 'Plan 2' },
			{ name: 'Plan 10' },
			{ name: 'Plan 30' },
		])
	})

	it('should sort plans with same numbers by their names in descending order', () => {
		const plans = [
			{ name: 'Plan 1B' },
			{ name: 'Plan 1A' },
			{ name: 'Plan 1C' },
		]

		const sortedPlans = sortPlans(plans)

		expect(sortedPlans).toEqual([
			{ name: 'Plan 1C' },
			{ name: 'Plan 1B' },
			{ name: 'Plan 1A' },
		])
	})

	it('should handle plans with no numbers in their names', () => {
		const plans = [
			{ name: 'Plan B' },
			{ name: 'Plan A' },
			{ name: 'Plan D' },
			{ name: 'Plan C' },
		]

		const sortedPlans = sortPlans(plans)

		expect(sortedPlans).toEqual([
			{ name: 'Plan D' },
			{ name: 'Plan C' },
			{ name: 'Plan B' },
			{ name: 'Plan A' },
		])
	})

	it('should handle plans with mixed names with and without numbers', () => {
		const plans = [
			{ name: 'Plan 10' },
			{ name: 'Plan B' },
			{ name: 'Plan 2' },
			{ name: 'Plan A' },
		]

		const sortedPlans = sortPlans(plans)

		expect(sortedPlans).toEqual([
			{ name: 'Plan B' },
			{ name: 'Plan A' },
			{ name: 'Plan 2' },
			{ name: 'Plan 10' },
		])
	})

	it('should handle an empty array of plans', () => {
		const plans = []

		const sortedPlans = sortPlans(plans)

		expect(sortedPlans).toEqual([])
	})

	it('should handle plans with names that do not contain numbers', () => {
		const plans = [
			{ name: 'Free Plan' },
			{ name: 'Basic Plan' },
			{ name: 'Advanced Plan' },
			{ name: 'Premium Plan' },
		]

		const sortedPlans = sortPlans(plans)

		expect(sortedPlans).toEqual([
			{ name: 'Premium Plan' },
			{ name: 'Free Plan' },
			{ name: 'Basic Plan' },
			{ name: 'Advanced Plan' },
		])
	})
})
