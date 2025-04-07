/**
 * Calculates penalty based on active ratio
 *
 * @param activeRatio - Ratio of active to elapsed time
 * @returns Penalty score
 */
export function calculateActiveRatioPenalty(activeRatio: number): number {
	// Lower active ratio means more pauses/gaps in work
	// Ideal: 1.0 (all time is active)
	// Penalty increases as active ratio decreases
	return Math.round((1 - activeRatio) * 40)
}
