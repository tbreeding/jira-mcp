/**
 * Assignee Change Tracking Module for Context Switch Analysis
 *
 * This module extracts and processes assignee changes from Jira issue changelogs.
 * It identifies when team members are added, removed, or changed as assignees on an issue,
 * capturing the context of each change including the current status and timing. These
 * assignee transitions represent context switches that can impact workflow continuity,
 * knowledge transfer effectiveness, and overall issue resolution velocity.
 */
import { getCurrentStatus } from './statusTracking'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Extracts all assignee changes from the issue changelog
 *
 * @param issue - The Jira issue to analyze
 * @returns Array of assignee changes with context
 */
export function extractAssigneeChangesFromChangelog(issue: JiraIssue): Array<{
	date: string
	fromAssignee: string | null
	toAssignee: string | null
	status: string | null
}> {
	const assigneeChanges: Array<{
		date: string
		fromAssignee: string | null
		toAssignee: string | null
		status: string | null
	}> = []

	// If no changelog, return empty array
	if (!issue.changelog || !issue.changelog.histories) {
		return assigneeChanges
	}

	// Process each history entry
	issue.changelog.histories.forEach(function (history) {
		// Check if this history entry contains assignee changes
		const assigneeItem = history.items.find(function (item) {
			return item.field === 'assignee'
		})

		if (assigneeItem) {
			// Get the status at the time of this change
			const currentStatus = getCurrentStatus(issue, history.created)

			// Add to our list of assignee changes
			assigneeChanges.push({
				date: history.created,
				fromAssignee: assigneeItem.fromString || null,
				toAssignee: assigneeItem.toString || null,
				status: currentStatus,
			})
		}
	})

	return assigneeChanges
}
