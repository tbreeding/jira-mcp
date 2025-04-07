/**
 * This file provides functionality to track and determine issue assignees at specific points in time.
 * By analyzing the changelog history, it reconstructs the assignee state at any given timestamp,
 * which is essential for understanding ownership patterns, tracking responsibility transitions,
 * and attributing work periods to specific team members. This historical assignee data is used
 * in work fragmentation analysis to identify how handoffs between team members affect progress.
 */

import { extractAssigneeFromChange } from './extractAssigneeFromChange'
import { findAssigneeChangesBefore } from './findAssigneeChangesBefore'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Gets the assignee at a specific point in time
 *
 * @param issue - The Jira issue
 * @param timestamp - The timestamp to check
 * @returns The assignee at that time, or null if not determinable
 */
export function getCurrentAssignee(issue: JiraIssue, timestamp: string): string | null {
	const targetTime = new Date(timestamp).getTime()

	// Get all assignee changes before the target time
	const assigneeChanges = findAssigneeChangesBefore(issue, targetTime)

	// If we have assignee changes before this time, get the most recent one
	if (assigneeChanges.length > 0) {
		return extractAssigneeFromChange(assigneeChanges[0])
	}

	// If no assignee changes, return the current assignee
	return issue.fields.assignee?.displayName || null
}
