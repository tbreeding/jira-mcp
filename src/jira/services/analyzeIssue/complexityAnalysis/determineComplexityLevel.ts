/**
 * Determines the complexity level based on the score
 *
 * @param score - The complexity score on a scale of 1-10
 * @returns Complexity level classification
 */
export function determineComplexityLevel(
	score: number,
): 'trivial' | 'simple' | 'moderate' | 'complex' | 'very complex' {
	if (score <= 2) {
		return 'trivial'
	} else if (score <= 4) {
		return 'simple'
	} else if (score <= 6) {
		return 'moderate'
	} else if (score <= 8) {
		return 'complex'
	} else {
		return 'very complex'
	}
}
