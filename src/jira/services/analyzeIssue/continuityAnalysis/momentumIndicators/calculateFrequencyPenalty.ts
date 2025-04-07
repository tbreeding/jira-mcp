/**
 * Calculates penalty for frequency of stagnation periods
 *
 * @param periodCount - The number of stagnation periods
 * @returns Penalty points for frequency
 */
export function calculateFrequencyPenalty(periodCount: number): number {
	if (periodCount >= 4) {
		return 2
	} else if (periodCount >= 2) {
		return 1
	}
	return 0
}
