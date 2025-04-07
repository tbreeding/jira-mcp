/**
 * Category Adjustments Application for Completeness Score
 *
 * This utility applies various category-specific adjustments to the completeness score
 * of Jira issues. It iterates through multiple requirement categories, applying individual
 * adjustments based on the presence, absence, or quality of each category. The module
 * is essential for producing an accurate and nuanced completeness evaluation by considering
 * the relative importance and interdependencies of different requirement categories.
 */
import { adjustScoreForCategory } from './adjustScoreForCategory'
import type { CategoryCheckResult } from '../completenessEvaluation.types'
import type { CategoryWeights } from './initializeCategoryWeights'
import type { ContextualRequirements } from '../types/contextualRequirements.types'

/**
 * Applies all category adjustments to calculate the score
 */
export function applyCategoryAdjustments(
	baseScore: number,
	weights: CategoryWeights,
	requirements: ContextualRequirements,
	isFrontend: boolean,
	acceptanceCriteriaResult: CategoryCheckResult,
	technicalConstraintsResult: CategoryCheckResult,
	dependenciesResult: CategoryCheckResult,
	testingRequirementsResult: CategoryCheckResult,
	designSpecificationsResult: CategoryCheckResult,
	userImpactResult: CategoryCheckResult,
): number {
	let score = baseScore

	// Apply adjustments for each category
	score = adjustScoreForCategory(
		score,
		acceptanceCriteriaResult,
		weights.acceptanceCriteria,
		true, // Acceptance criteria always required
	)

	score = adjustScoreForCategory(
		score,
		technicalConstraintsResult,
		weights.technicalConstraints,
		requirements.needsTechnicalConstraints,
	)

	score = adjustScoreForCategory(
		score,
		dependenciesResult,
		weights.dependencies,
		true, // Dependencies always important to track
	)

	score = adjustScoreForCategory(
		score,
		testingRequirementsResult,
		weights.testingRequirements,
		requirements.needsTestingRequirements,
	)

	score = adjustScoreForCategory(
		score,
		designSpecificationsResult,
		weights.designSpecifications,
		requirements.needsDesignSpecifications || isFrontend, // Always check design for frontend issues
	)

	score = adjustScoreForCategory(score, userImpactResult, weights.userImpact, requirements.needsUserImpact)

	return score
}
