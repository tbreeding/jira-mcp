/**
 * Helper functions for analyzing duration-related risks in Jira issues
 *
 * These functions identify risks related to sprint boundaries, reassignments,
 * status cycling, and blocked time in issues.
 */

import type { DurationAssessment } from '../../durationAssessment/types/durationAssessment.types'

/**
 * Check for sprint boundary issues in duration data
 */
export function checkSprintBoundaryIssues(
	durationData: DurationAssessment,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	if (!durationData.exceedsSprint) {
		return 0
	}

	riskItems.push('Issue likely to exceed sprint boundary')
	mitigationSuggestions.push('Plan for possibility of work extending beyond sprint boundaries')
	return 2
}

/**
 * Check for multiple sprint reassignments in duration data
 */
export function checkSprintReassignments(
	durationData: DurationAssessment,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	if (!durationData.sprintReassignments || durationData.sprintReassignments <= 1) {
		return 0
	}

	riskItems.push(`Issue has been reassigned across sprints ${durationData.sprintReassignments} times`)
	mitigationSuggestions.push('Review scope and possibly break down into smaller tasks')
	return Math.min(durationData.sprintReassignments, 4)
}

/**
 * Check for status cycling/revisits in duration data
 */
export function checkStatusCycling(
	durationData: DurationAssessment,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	if (!durationData.statusCycling || durationData.statusCycling.totalRevisits <= 1) {
		return 0
	}

	riskItems.push(`Issue has cycled through statuses ${durationData.statusCycling.totalRevisits} times`)
	mitigationSuggestions.push('Ensure clear definition of done for each stage to avoid rework')
	return 2
}

/**
 * Check for blocked time in duration data
 */
export function checkBlockedTime(durationData: DurationAssessment, riskItems: string[]): number {
	if (!durationData.blockedTime || durationData.blockedTime.totalDays <= 3) {
		return 0
	}

	riskItems.push(`Issue has been blocked for ${Math.round(durationData.blockedTime.totalDays)} days`)
	return Math.min(Math.floor(durationData.blockedTime.totalDays / 2), 3)
}

/**
 * Check for anomalies in duration data
 */
export function checkDurationAnomalies(durationData: DurationAssessment, riskItems: string[]): number {
	if (!durationData.anomalies || durationData.anomalies.length === 0) {
		return 0
	}

	riskItems.push('Duration anomalies detected: ' + durationData.anomalies[0])
	return 1
}
