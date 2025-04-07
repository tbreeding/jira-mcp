/**
 * Assignment Changes Counter
 *
 * This utility analyzes the history of a Jira issue to count how many times the assignee has changed.
 * Frequent assignee changes can indicate team instability, unclear ownership, or resource allocation
 * issues. By tracking these changes, the module provides insights into team dynamics and potential
 * process inefficiencies. This metric helps identify issues that may have suffered from handoff
 * problems or insufficient continuity, which can impact delivery quality and velocity.
 */
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Counts the number of assignee changes in the issue history
 */
export function countAssignmentChanges(issue: JiraIssue): number {
	const assigneeChanges = issue.changelog.histories.filter((history) =>
		history.items.some((item) => item.field === 'assignee'),
	)

	return assigneeChanges.length
}
