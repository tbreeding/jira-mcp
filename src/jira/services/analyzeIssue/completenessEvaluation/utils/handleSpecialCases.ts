/**
 * Special Case Handling for Completeness Score Calculation
 *
 * This utility provides logic for handling special cases in the completeness scoring system
 * for Jira issues. It addresses edge cases such as completely empty issues (with no requirements),
 * non-frontend issues that are missing only design specifications, and other exceptional scenarios.
 * These special case adjustments ensure that the scoring system produces intuitive and useful
 * results across a wide range of issue types and documentation patterns.
 */
import { areAllCategoriesAbsent } from './areAllCategoriesAbsent'
import { areAllOtherCategoriesPresent } from './areAllOtherCategoriesPresent'
import { isNonFrontendWithDesignAbsent } from './isNonFrontendWithDesignAbsent'
import type { CategoryCheckResult } from '../completenessEvaluation.types'

/**
 * Handles special cases for completeness scoring
 */
export function handleSpecialCases(
	score: number,
	isFrontend: boolean,
	acceptanceCriteriaResult: CategoryCheckResult,
	technicalConstraintsResult: CategoryCheckResult,
	dependenciesResult: CategoryCheckResult,
	testingRequirementsResult: CategoryCheckResult,
	designSpecificationsResult: CategoryCheckResult,
	userImpactResult: CategoryCheckResult,
): number {
	// Special case for all absent categories
	if (
		areAllCategoriesAbsent(
			acceptanceCriteriaResult,
			technicalConstraintsResult,
			dependenciesResult,
			testingRequirementsResult,
			designSpecificationsResult,
			userImpactResult,
		)
	) {
		return 1
	}

	// Check if all other categories are present
	const otherCategoriesPresent = areAllOtherCategoriesPresent(
		acceptanceCriteriaResult,
		technicalConstraintsResult,
		dependenciesResult,
		testingRequirementsResult,
		userImpactResult,
	)

	// For non-frontend issues with absent design specs but all others present
	if (isNonFrontendWithDesignAbsent(isFrontend, designSpecificationsResult, otherCategoriesPresent)) {
		return 9
	}

	return score
}
