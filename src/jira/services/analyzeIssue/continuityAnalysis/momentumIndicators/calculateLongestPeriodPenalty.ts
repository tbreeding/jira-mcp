/**
 * Calculates penalty for longest stagnation period
 *
 * @param longestStagnationDays - Duration of the longest stagnation period in days
 * @returns Penalty points for longest period
 */
export function calculateLongestPeriodPenalty(longestStagnationDays: number): number {
	if (longestStagnationDays > 15) {
		return 3
	} else if (longestStagnationDays > 10) {
		return 2
	} else if (longestStagnationDays > 7) {
		return 1
	}
	return 0
}
