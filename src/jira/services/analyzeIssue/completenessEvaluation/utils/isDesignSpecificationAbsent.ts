/**
 * Design Specification Absence Checker for Completeness Evaluation
 *
 * This utility function provides a simple check to determine if design specifications
 * are absent from a Jira issue. It examines the CategoryCheckResult for design specifications
 * and returns a boolean indicating their absence. This check is particularly important for
 * issues that may require design documentation, and helps the completeness evaluation
 * system make appropriate scoring adjustments based on design documentation presence.
 */
import type { CategoryCheckResult } from '../completenessEvaluation.types'

/**
 * Checks if design specifications are absent
 */
export function isDesignSpecificationAbsent(designSpecificationsResult: CategoryCheckResult): boolean {
	return !designSpecificationsResult.present
}
