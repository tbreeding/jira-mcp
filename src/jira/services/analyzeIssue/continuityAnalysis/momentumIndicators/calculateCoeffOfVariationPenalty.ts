/**
 * Calculates penalty for high coefficient of variation (inconsistent updates)
 *
 * @param coeffOfVariation - Coefficient of variation of update gaps
 * @returns Penalty points
 */
export function calculateCoeffOfVariationPenalty(coeffOfVariation: number): number {
	if (coeffOfVariation > 2.0) {
		return 5
	} else if (coeffOfVariation > 1.5) {
		return 4
	} else if (coeffOfVariation > 1.0) {
		return 3
	} else if (coeffOfVariation > 0.75) {
		return 2
	} else if (coeffOfVariation > 0.5) {
		return 1
	}
	return 0
}
