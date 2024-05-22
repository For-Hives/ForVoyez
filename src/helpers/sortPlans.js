export function sortPlans(plans) {
	plans.sort((a, b) => {
		// Extract the numbers from the plan names
		const numA = parseInt(a.name.match(/\d+/)?.[0] || '0')
		const numB = parseInt(b.name.match(/\d+/)?.[0] || '0')

		// Compare the numbers
		if (numA !== numB) {
			return numA - numB
		}

		// If the numbers are the same, compare the names
		return b.name.localeCompare(a.name)
	})
	return plans
}
