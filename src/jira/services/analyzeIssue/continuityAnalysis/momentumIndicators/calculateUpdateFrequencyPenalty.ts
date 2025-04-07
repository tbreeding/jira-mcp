/**
 * Calculates penalty for low update frequency
 *
 * @param updatesPerDay - Average number of updates per day
 * @returns Penalty points
 */
export function calculateUpdateFrequencyPenalty(updatesPerDay: number): number {
	if (updatesPerDay < 0.1) {
		// Less than 1 update per 10 days
		return 3
	} else if (updatesPerDay < 0.2) {
		// Less than 1 update per 5 days
		return 2
	} else if (updatesPerDay < 0.3) {
		// Less than 1 update per ~3 days
		return 1
	}
	return 0
}
