/**
 * This file analyzes assignee changes in Jira issues to assess complexity.
 * It tracks how many times an issue has been reassigned to different team members.
 * Multiple reassignments often indicate complexity, confusion about ownership,
 * or skill mismatches. This analysis provides insights into the human resource
 * aspects of issue complexity and potential team collaboration challenges.
 */
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Counts the number of assignee changes
 *
 * @param issue - The Jira issue to analyze
 * @returns Score and factor describing complexity from assignee changes
 */
export function countAssigneeChanges(issue: JiraIssue): { score: number; factor: string | null } {
	let assigneeChanges = 0
	let previousAssignee: string | null = null

	// Analyze changelog for assignee changes
	if (issue.changelog && issue.changelog.histories) {
		issue.changelog.histories.forEach(function (history) {
			history.items.forEach(function (item) {
				if (item.field === 'assignee') {
					// Only count if it's a different assignee
					if (previousAssignee !== item.to) {
						assigneeChanges++
						previousAssignee = item.to as string | null
					}
				}
			})
		})
	}

	let score = 0
	if (assigneeChanges > 2) {
		score = 2
	} else if (assigneeChanges > 0) {
		score = 1
	}

	const factor = assigneeChanges > 0 ? `Assignee changes: Issue was reassigned ${assigneeChanges} times` : null

	return { score, factor }
}
