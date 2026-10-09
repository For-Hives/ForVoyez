const PLAN_NUMBER = /\d+/

export function sortPlans(plans) {
	plans.sort((a, b) => {
		// Extract the numbers from the plan names
		const numA = parseInt(a.name.match(PLAN_NUMBER)?.[0] || '0', 10)
		const numB = parseInt(b.name.match(PLAN_NUMBER)?.[0] || '0', 10)

		// Compare the numbers
		if (numA !== numB) {
			return numA - numB
		}

		// If the numbers are the same, compare the names
		return b.name.localeCompare(a.name)
	})
	return plans
}
