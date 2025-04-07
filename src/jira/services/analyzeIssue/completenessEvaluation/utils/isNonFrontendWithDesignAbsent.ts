/**
 * This file provides a utility function to check if a Jira issue is non-frontend related but is missing
 * design specifications while having all other categories present. This is part of the completeness
 * evaluation process that identifies issues which may be appropriately documented for their type.
 * Some issues (like backend tasks) may not require design specifications, and this function helps
 * to identify those cases.
 */
import { isDesignSpecificationAbsent } from './isDesignSpecificationAbsent'
import type { CategoryCheckResult } from '../completenessEvaluation.types'

/**
 * Checks if this is a non-frontend issue with all categories present except design
 */
export function isNonFrontendWithDesignAbsent(
	isFrontend: boolean,
	designSpecificationsResult: CategoryCheckResult,
	otherCategoriesPresent: boolean,
): boolean {
	return !isFrontend && isDesignSpecificationAbsent(designSpecificationsResult) && otherCategoriesPresent
}
