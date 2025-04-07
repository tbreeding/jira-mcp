/**
 * Duration Assessment Module
 *
 * This module serves as the main entry point for comprehensive duration analysis of Jira issues.
 * It orchestrates the collection and processing of various timing metrics, including time spent
 * in different statuses, blocked periods, and cycle time. The assessment identifies anomalies,
 * inefficiencies, and patterns in the issue's lifecycle to provide insights into workflow
 * optimization opportunities and help teams improve their development process velocity.
 */
import { analyzeSprintBoundaries } from './analyzeSprintBoundaries'
import { assessBlockedTime } from './assessBlockedTime'
import { calculateInProgressDuration } from './calculateInProgressDuration'
import { calculateStatusTimings } from './calculateStatusTimings'
import { detectStatusCycling } from './detectStatusCycling'
import { identifyDurationAnomalies } from './identifyDurationAnomalies'
import { calculatePointToDurationRatio } from './utils/storyPoints/calculatePointToDurationRatio'
import type { DurationAssessment } from './types/durationAssessment.types'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Performs a comprehensive duration assessment of a Jira issue
 * @param issue The Jira issue to analyze
 * @param commentsResponse The comments associated with the issue
 * @returns Duration assessment results
 */
export function getDurationAssessment(issue: JiraIssue, commentsResponse: IssueCommentResponse): DurationAssessment {
	// Calculate in-progress duration
	const { inProgressDays, firstInProgress, lastDone } = calculateInProgressDuration(issue)

	// Analyze sprint boundaries
	const { exceedsSprint, sprintReassignments } = analyzeSprintBoundaries(issue)

	// Calculate point to duration ratio
	const pointToDurationRatio = calculatePointToDurationRatio(issue, inProgressDays)

	// Calculate status timings
	const averageTimeInStatus = calculateStatusTimings(issue)

	// Detect status cycling
	const statusCycling = detectStatusCycling(issue)

	// Assess blocked time
	const blockedTime = assessBlockedTime(issue, commentsResponse)

	// Identify anomalies
	const anomalies = identifyDurationAnomalies(
		issue,
		inProgressDays,
		sprintReassignments,
		pointToDurationRatio,
		statusCycling.totalRevisits,
	)

	return {
		inProgressDays,
		exceedsSprint,
		sprintReassignments,
		pointToDurationRatio,
		statusTransitions: {
			firstInProgress,
			lastDone,
			averageTimeInStatus,
		},
		statusCycling: {
			count: statusCycling.count,
			totalRevisits: statusCycling.totalRevisits,
		},
		blockedTime: {
			totalDays: blockedTime.totalDays,
			reasons: blockedTime.reasons,
		},
		anomalies,
	}
}
