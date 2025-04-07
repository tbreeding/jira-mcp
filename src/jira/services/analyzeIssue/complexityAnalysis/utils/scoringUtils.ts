/**
 * Utilities for calculating complexity scores and generating complexity factors
 */

/**
 * Calculates complexity score based on keyword count
 *
 * @param keywordCount - Number of keywords found
 * @returns Complexity score (0-3)
 */
export function calculateComplexityScore(keywordCount: number): number {
	if (keywordCount > 5) {
		return 3
	}

	if (keywordCount > 2) {
		return 2
	}

	if (keywordCount > 0) {
		return 1
	}

	return 0
}

/**
 * Creates a factor message based on found keywords
 *
 * @param keywordsFound - Array of found keywords
 * @returns Factor message or null if no keywords found
 */
export function createComplexityFactor(keywordsFound: string[]): string | null {
	if (keywordsFound.length === 0) {
		return null
	}

	const topKeywords = keywordsFound.slice(0, 3).join(', ')
	const ellipsis = keywordsFound.length > 3 ? '...' : ''

	return `Technical complexity indicators: ${topKeywords}${ellipsis}`
}
