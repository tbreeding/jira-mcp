/**
 * Helper function for processing duration assessment data to identify timeline risks
 *
 * This file provides coordination for checking various duration-related risk factors
 * and calculating their combined impact on risk score.
 */

import {
	checkSprintBoundaryIssues,
	checkSprintReassignments,
	checkStatusCycling,
	checkBlockedTime,
	checkDurationAnomalies,
} from './durationRiskHelpers'
import type { DurationAssessment } from '../../durationAssessment/types/durationAssessment.types'

/**
 * Process duration assessment data to identify timeline risks
 *
 * @param durationData - Duration assessment data to process
 * @param riskItems - Array to append identified risk items to
 * @param mitigationSuggestions - Array to append mitigation suggestions to
 * @returns Additional risk score based on duration data
 */
export function processDurationData(
	durationData: DurationAssessment,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	let additionalScore = 0

	// Check for sprint boundary issues
	additionalScore += checkSprintBoundaryIssues(durationData, riskItems, mitigationSuggestions)

	// Check for multiple sprint reassignments
	additionalScore += checkSprintReassignments(durationData, riskItems, mitigationSuggestions)

	// Check for status cycling/revisits
	additionalScore += checkStatusCycling(durationData, riskItems, mitigationSuggestions)

	// Check for significant blocked time
	additionalScore += checkBlockedTime(durationData, riskItems)

	// Check for anomalies
	additionalScore += checkDurationAnomalies(durationData, riskItems)

	return additionalScore
}
