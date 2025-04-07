/**
 * Other Categories Presence Checker for Completeness Evaluation
 *
 * This utility function determines if all requirement categories except design specifications
 * are present in a Jira issue. It is used to identify issues that may have thorough requirements
 * in most areas but are specifically missing design details. This check is important for
 * properly adjusting completeness scores in scenarios where design may be less critical or
 * expected to come later in the development process.
 */
import type { CategoryCheckResult } from '../completenessEvaluation.types'

/**
 * Checks if all required categories except design are present
 */
export function areAllOtherCategoriesPresent(
	acceptanceCriteriaResult: CategoryCheckResult,
	technicalConstraintsResult: CategoryCheckResult,
	dependenciesResult: CategoryCheckResult,
	testingRequirementsResult: CategoryCheckResult,
	userImpactResult: CategoryCheckResult,
): boolean {
	return (
		acceptanceCriteriaResult.present &&
		technicalConstraintsResult.present &&
		dependenciesResult.present &&
		testingRequirementsResult.present &&
		userImpactResult.present
	)
}
