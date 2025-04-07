/**
 * Active time calculation for flow efficiency analysis
 *
 * This file implements logic for calculating active time in Jira issue workflows,
 * distinguishing between active work time and waiting time to determine flow
 * efficiency ratios and identify process improvement opportunities.
 */

import { handleIssueWithoutHistory } from './historyHandling'
import { extractStatusChanges, calculateActiveTimeFromStatusChanges } from './statusChanges'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Calculates the total time spent in active work statuses
 *
 * @param issue - The Jira issue
 * @returns The total active work time in milliseconds
 */
export function calculateActiveWorkTime(issue: JiraIssue): number {
	// If no history, handle based on current status
	if (!issue.changelog || !issue.changelog.histories || issue.changelog.histories.length === 0) {
		return handleIssueWithoutHistory(issue)
	}

	// Get all status changes from the changelog
	const statusChanges = extractStatusChanges(issue)

	// If no status changes, check if initial status is active
	if (statusChanges.length === 0) {
		return handleIssueWithoutHistory(issue)
	}

	// Process status changes to calculate active time
	return calculateActiveTimeFromStatusChanges(issue, statusChanges)
}
