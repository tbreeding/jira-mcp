/**
 * Ensures the score is within the valid range (1-10)
 */
export function boundScoreValue(score: number): number {
	return Math.max(1, Math.min(10, Math.round(score)))
}
