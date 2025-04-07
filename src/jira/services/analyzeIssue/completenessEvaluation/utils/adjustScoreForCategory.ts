/**
 * Score Adjustment Utility for Completeness Evaluation
 *
 * This utility function adjusts the completeness score based on specific category weights.
 * It handles score adjustments for different requirement categories in a Jira issue,
 * applying various weighting factors to ensure the final score accurately reflects
 * the relative importance of each category. This component is part of the larger
 * completeness evaluation system for Jira issues.
 */
import type { CategoryCheckResult } from '../completenessEvaluation.types'

/**
 * Adjusts the score based on a category result and its weight
 */
export function adjustScoreForCategory(
	score: number,
	result: CategoryCheckResult,
	weight: number,
	isRequired: boolean,
): number {
	// Skip adjustment if this category is not required for this context
	if (!isRequired) {
		return score
	}

	if (!result.present) {
		return score - weight
	}

	if (result.quality === 'partial') {
		return score - weight / 2
	}

	return score
}
