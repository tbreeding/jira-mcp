/**
 * Calculates penalty based on number of active periods
 *
 * @param periodCount - Number of active work periods
 * @returns Penalty score
 */
export function calculatePeriodCountPenalty(periodCount: number): number {
	// More periods mean more fragmentation
	// Ideal: 1 period
	// Penalty increases with number of periods
	if (periodCount <= 1) {
		return 0
	} else if (periodCount <= 3) {
		return 10 * (periodCount - 1)
	} else if (periodCount <= 5) {
		return 20 + 15 * (periodCount - 3)
	} else {
		return 50 + 10 * Math.min(5, periodCount - 5)
	}
}
