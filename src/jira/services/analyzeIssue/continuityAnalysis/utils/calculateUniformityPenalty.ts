/**
 * Calculates penalty based on uniformity of period durations
 *
 * @param coeffOfVariation - Coefficient of variation for period durations
 * @returns Penalty score
 */
export function calculateUniformityPenalty(coeffOfVariation: number): number {
	// Higher coefficient of variation means more inconsistent work periods
	// Ideal: 0 (all periods are the same duration)
	// Penalty increases with coefficient of variation
	return Math.min(30, Math.round(coeffOfVariation * 30))
}
