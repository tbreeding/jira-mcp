/**
 * Late Stage Switches Analysis Module
 *
 * This module identifies assignee changes that occurred late in the issue lifecycle.
 * It helps determine if handoffs happened at critical moments in the issue's development,
 * which may have a more significant impact on velocity and delivery.
 */
import type { AssigneeChange } from './types/contextSwitches.types'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Identifies assignee changes that occurred late in the issue lifecycle
 *
 * @param issue - The Jira issue
 * @param assigneeChanges - The list of assignee changes
 * @returns Array of late-stage assignee changes
 */
export function identifyLateStageSwitches(issue: JiraIssue, assigneeChanges: AssigneeChange[]): AssigneeChange[] {
	// Define "late stage" as after 70% of the issue's lifecycle
	const LATE_STAGE_THRESHOLD = 0.7

	// Get total duration
	const startDate = new Date(issue.fields.created).getTime()
	const endDate =
		issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string'
			? new Date(issue.fields.resolutiondate).getTime()
			: new Date().getTime()

	const totalDuration = endDate - startDate
	const lateStageThreshold = startDate + totalDuration * LATE_STAGE_THRESHOLD

	// Find changes that occurred after the threshold
	return assigneeChanges.filter(function (change) {
		return new Date(change.date).getTime() >= lateStageThreshold
	})
}
