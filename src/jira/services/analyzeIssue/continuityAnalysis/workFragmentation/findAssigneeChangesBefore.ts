/**
 * This file provides a utility function to find assignee changes that occurred before a specific timestamp.
 * It filters and sorts the Jira issue changelog to extract only the relevant assignee change history entries.
 * The function is essential for reconstructing issue state at any point in time, particularly for
 * determining who was assigned to an issue during different phases of work. This temporal tracking
 * enables accurate attribution of work periods and analysis of handoff patterns between team members.
 */

import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Finds all assignee changes in the issue history that occurred before the given timestamp
 *
 * @param issue - The Jira issue to analyze
 * @param targetTime - The timestamp in milliseconds to use as cutoff
 * @returns Array of changelog history entries sorted by date (most recent first)
 */
export function findAssigneeChangesBefore(issue: JiraIssue, targetTime: number): JiraIssue['changelog']['histories'] {
	// If no changelog or no histories, return empty array
	if (!issue.changelog || !issue.changelog.histories || !Array.isArray(issue.changelog.histories)) {
		return []
	}

	// Filter history entries to get only assignee changes before the target time
	return (
		issue.changelog.histories
			.filter((history) => {
				// Check if history has items and created date
				if (!history.items || !history.created) {
					return false
				}

				// Check if any items are assignee changes
				const hasAssigneeChange = history.items.some((item) => item.field === 'assignee')
				if (!hasAssigneeChange) {
					return false
				}

				// Check if the change happened before the target time
				const changeTime = new Date(history.created).getTime()
				return changeTime <= targetTime
			})
			// Sort by date, most recent first
			.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
	)
}
