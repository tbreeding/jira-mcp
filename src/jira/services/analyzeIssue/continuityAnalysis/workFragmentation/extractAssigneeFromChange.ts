/**
 * This file provides a utility function to extract assignee information from Jira changelog entries.
 * It parses a history entry to locate and extract the assignee field value after a change occurred.
 * This function is crucial for tracking ownership changes throughout an issue's lifecycle and
 * supports analysis of team collaboration patterns, handoffs, and their impact on work continuity.
 * The extraction of clean assignee data enables the system to attribute work periods to team members.
 */

import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Extracts assignee information from a changelog history entry
 *
 * @param historyEntry - The history entry containing assignee change
 * @returns The assignee string, or null if not found
 */
export function extractAssigneeFromChange(historyEntry: JiraIssue['changelog']['histories'][0]): string | null {
	const assigneeItem = historyEntry.items.find((item) => item.field === 'assignee')
	return assigneeItem ? assigneeItem.toString : null
}
