/**
 * Duration Anomalies Identifier
 *
 * This module analyzes issues to detect unusual or anomalous durations in their lifecycle.
 * It examines various metrics such as in-progress duration, sprint reassignments, and status
 * cycling to identify issues that deviate from expected patterns. By flagging these anomalies,
 * the module helps teams identify process bottlenecks, delivery risks, and opportunities for
 * improving workflow efficiency. The analysis takes into account issue type-specific expectations
 * and organizational norms to provide context-aware anomaly detection.
 */
import { checkIssueTypeTimeline } from './anomalies/checkIssueTypeTimeline'
import { checkLongDuration } from './anomalies/checkLongDuration'
import { checkSprintBoundaries } from './anomalies/checkSprintBoundaries'
import { checkStatusCycling } from './anomalies/checkStatusCycling'
import { checkVelocityIssues } from './anomalies/checkVelocityIssues'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Identifies anomalies in the time spent on a Jira issue
 * @param issue Jira issue
 * @param inProgressDays Business days the issue has been in progress
 * @param sprintReassignments Number of sprint reassignments
 * @param pointToDurationRatio Story points to duration ratio
 * @param statusCyclingTotal Total number of status revisits
 * @returns Array of anomaly messages
 */
export function identifyDurationAnomalies(
	issue: JiraIssue,
	inProgressDays: number | null,
	sprintReassignments: number,
	pointToDurationRatio: number | null,
	statusCyclingTotal: number,
): string[] {
	const anomalies: string[] = []

	// Check for long duration
	const longDurationAnomaly = checkLongDuration(inProgressDays)
	if (longDurationAnomaly) {
		anomalies.push(longDurationAnomaly)
	}

	// Check for sprint boundary issues
	const sprintBoundaryAnomaly = checkSprintBoundaries(sprintReassignments)
	if (sprintBoundaryAnomaly) {
		anomalies.push(sprintBoundaryAnomaly)
	}

	// Check for velocity issues
	const velocityAnomalies = checkVelocityIssues(pointToDurationRatio)
	if (velocityAnomalies.length > 0) {
		anomalies.push(...velocityAnomalies)
	}

	// Check for status cycling
	const statusCyclingAnomaly = checkStatusCycling(statusCyclingTotal)
	if (statusCyclingAnomaly) {
		anomalies.push(statusCyclingAnomaly)
	}

	// Check for issue type specific anomalies
	const issueType = issue.fields.issuetype.name
	const issueTypeAnomalies = checkIssueTypeTimeline(issueType, inProgressDays)
	if (issueTypeAnomalies.length > 0) {
		anomalies.push(...issueTypeAnomalies)
	}

	return anomalies
}
