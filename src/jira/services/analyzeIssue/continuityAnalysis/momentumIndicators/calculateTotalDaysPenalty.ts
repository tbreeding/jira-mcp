/**
 * Calculates penalty for total stagnation days
 *
 * @param totalStagnationDays - The total number of stagnation days
 * @returns Penalty points for total stagnation
 */
export function calculateTotalDaysPenalty(totalStagnationDays: number): number {
	if (totalStagnationDays > 30) {
		return 5
	} else if (totalStagnationDays > 20) {
		return 4
	} else if (totalStagnationDays > 15) {
		return 3
	} else if (totalStagnationDays > 10) {
		return 2
	} else if (totalStagnationDays > 5) {
		return 1
	}
	return 0
}
