/**
 * Calculates base score based on the number of comments
 *
 * @param commentCount - The number of comments on the issue
 * @returns Base score for comment quantity
 */
export function calculateBaseCommentScore(commentCount: number): number {
	// Use ranges to simplify score calculation
	const scoreRanges = [
		{ min: 15, score: 10 }, // Excellent communication
		{ min: 10, score: 9 },
		{ min: 8, score: 8 },
		{ min: 6, score: 7 },
		{ min: 4, score: 6 },
		{ min: 3, score: 5 },
		{ min: 2, score: 4 },
		{ min: 0, score: 3 }, // Minimal communication
	]

	// Find the first range where the comment count is >= the minimum
	const matchingRange = scoreRanges.find((range) => commentCount >= range.min)

	// This should never be undefined since we have a range starting at 0
	return matchingRange ? matchingRange.score : 3
}
