/**
 * History processing utilities for flow efficiency analysis
 *
 * This file provides functionality for processing and analyzing issue history
 * data from Jira, handling edge cases such as missing history records and
 * ensuring robust calculation of flow metrics across different issue patterns.
 */

import { isActiveStatus } from '../utils/isActiveStatus'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Handles calculation for issues without history
 *
 * @param issue - The Jira issue
 * @returns Active time in milliseconds
 */
export function handleIssueWithoutHistory(issue: JiraIssue): number {
	// Check if current status is active
	return handleIssueWithoutStatusChanges(issue)
}

/**
 * Handles calculation for issues without status changes
 *
 * @param issue - The Jira issue
 * @returns Active time in milliseconds (0 or total time if active)
 */
function handleIssueWithoutStatusChanges(issue: JiraIssue): number {
	const currentStatus = issue.fields.status?.name
	if (currentStatus && isActiveStatus(currentStatus)) {
		// Calculate time from creation to now or resolution
		const startDate = new Date(issue.fields.created)
		const endDate =
			issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string'
				? new Date(issue.fields.resolutiondate)
				: new Date()

		return endDate.getTime() - startDate.getTime()
	}
	return 0
}
