/**
 * Status Tracking Module for Context Switch Analysis
 *
 * This module provides functionality to track and analyze Jira issue status changes over time.
 * It enables determining what status an issue was in at any specific point in its lifecycle
 * by analyzing the changelog history. This temporal status tracking is crucial for providing
 * context to other events like assignee changes, understanding the workflow phase during
 * which context switches occurred, and evaluating the impact of transitions on issue velocity.
 */
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Gets the issue status at a specific point in time
 *
 * @param issue - The Jira issue
 * @param timestamp - The timestamp to check
 * @returns The status at that time, or null if not determinable
 */
export function getCurrentStatus(issue: JiraIssue, timestamp: string): string | null {
	const targetTime = new Date(timestamp).getTime()

	// Find relevant status changes
	const statusChanges = findStatusChangesBefore(issue, targetTime)

	// If we have status changes before this time, get the most recent one
	if (statusChanges.length > 0) {
		return extractStatusFromChange(statusChanges[0])
	}

	// If no status changes, return the current status
	return issue.fields.status?.name || null
}

/**
 * Finds all status changes that occurred before or at the target time
 *
 * @param issue - The Jira issue
 * @param targetTime - The timestamp in milliseconds
 * @returns Sorted array of history entries containing status changes
 */
function findStatusChangesBefore(issue: JiraIssue, targetTime: number): JiraIssue['changelog']['histories'] {
	return (
		issue.changelog?.histories
			?.filter(function (history) {
				const historyTime = new Date(history.created).getTime()
				return (
					historyTime <= targetTime &&
					history.items.some(function (item) {
						return item.field === 'status'
					})
				)
			})
			.sort(function (a, b) {
				return new Date(b.created).getTime() - new Date(a.created).getTime()
			}) || []
	)
}

/**
 * Extracts status information from a changelog history entry
 *
 * @param historyEntry - The history entry containing status change
 * @returns The status string, or null if not found
 */
function extractStatusFromChange(historyEntry: JiraIssue['changelog']['histories'][0]): string | null {
	const statusItem = historyEntry.items.find(function (item) {
		return item.field === 'status'
	})
	return statusItem ? statusItem.toString : null
}
