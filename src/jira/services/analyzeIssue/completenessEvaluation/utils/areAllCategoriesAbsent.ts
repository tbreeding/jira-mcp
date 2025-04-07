/**
 * Category Absence Checker for Completeness Evaluation
 *
 * This utility function determines if all requirement categories are absent from a Jira issue.
 * It evaluates the presence of each category in the provided check results and determines
 * if none of the expected requirement categories are present. This information is crucial
 * for properly scoring issues that may be severely lacking in documentation or requirements.
 */
import type { CategoryCheckResult } from '../completenessEvaluation.types'

/**
 * Checks if all categories are absent
 */
export function areAllCategoriesAbsent(
	acceptanceCriteriaResult: CategoryCheckResult,
	technicalConstraintsResult: CategoryCheckResult,
	dependenciesResult: CategoryCheckResult,
	testingRequirementsResult: CategoryCheckResult,
	designSpecificationsResult: CategoryCheckResult,
	userImpactResult: CategoryCheckResult,
): boolean {
	return (
		!acceptanceCriteriaResult.present &&
		!technicalConstraintsResult.present &&
		!dependenciesResult.present &&
		!testingRequirementsResult.present &&
		!designSpecificationsResult.present &&
		!userImpactResult.present
	)
}
