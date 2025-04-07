/**
 * Jira issue completeness score calculation
 *
 * This file implements the algorithm for calculating the overall completeness
 * score of a Jira issue based on the presence and quality of various required
 * elements such as acceptance criteria, technical details, and dependencies.
 */

import { applyCategoryAdjustments } from './utils/applyCategoryAdjustments'
import { boundScoreValue } from './utils/boundScoreValue'
import { handleSpecialCases } from './utils/handleSpecialCases'
import { initializeCategoryWeights } from './utils/initializeCategoryWeights'
import { initializeRequirements } from './utils/initializeRequirements'
import { isFrontendIssue } from './utils/isFrontendIssue'
import type { CategoryCheckResult } from './completenessEvaluation.types'
import type { ContextualRequirements } from './types/contextualRequirements.types'

/**
 * Calculates a completeness score based on the results of all category checks
 * and the context-specific requirements
 */
export function calculateCompletenessScore(
	acceptanceCriteriaResult: CategoryCheckResult,
	technicalConstraintsResult: CategoryCheckResult,
	dependenciesResult: CategoryCheckResult,
	testingRequirementsResult: CategoryCheckResult,
	designSpecificationsResult: CategoryCheckResult,
	userImpactResult: CategoryCheckResult,
	issueType: string,
	contextualRequirements?: ContextualRequirements,
): number {
	// Start with base score of 10
	const baseScore = 10

	// Initialize requirements and weights
	const requirements = initializeRequirements(contextualRequirements)
	const isFrontend = isFrontendIssue(issueType)
	const weights = initializeCategoryWeights(isFrontend)

	// Apply category adjustments
	let score = applyCategoryAdjustments(
		baseScore,
		weights,
		requirements,
		isFrontend,
		acceptanceCriteriaResult,
		technicalConstraintsResult,
		dependenciesResult,
		testingRequirementsResult,
		designSpecificationsResult,
		userImpactResult,
	)

	// Handle special cases
	score = handleSpecialCases(
		score,
		isFrontend,
		acceptanceCriteriaResult,
		technicalConstraintsResult,
		dependenciesResult,
		testingRequirementsResult,
		designSpecificationsResult,
		userImpactResult,
	)

	// Ensure score is within 1-10 range
	return boundScoreValue(score)
}
