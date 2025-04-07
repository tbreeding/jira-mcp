/**
 * This file implements functionality to assess the impact of context switching on Jira issues.
 * It analyzes assignee changes throughout an issue's lifecycle to identify patterns of work handoffs
 * and quantify their potential impact on issue momentum and continuity. The module calculates
 * penalties for frequent assignee changes and back-and-forth reassignment patterns, which typically
 * correlate with reduced productivity and increased resolution time. The resulting score helps
 * identify issues with excessive context switching that may benefit from more stable ownership.
 */

import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Calculates a score for context switching impact
 *
 * @param issue - The Jira issue to analyze
 * @returns Context switching score (1-10)
 */
export function calculateContextSwitchingScore(issue: JiraIssue): number {
	// If no changelog, return neutral score
	if (!issue.changelog || !issue.changelog.histories || issue.changelog.histories.length === 0) {
		return 7
	}

	// Get assignee changes from changelog
	const assigneeChanges = getAssigneeChanges(issue)

	// Calculate frequency penalty based on change count
	const frequencyPenalty = calculateAssigneeChangeFrequencyPenalty(assigneeChanges.length)

	// Calculate back-and-forth penalty
	const backAndForthPenalty = calculateBackAndForthPenalty(assigneeChanges)

	// Calculate final score
	return Math.max(1, Math.min(10, 10 - frequencyPenalty - backAndForthPenalty))
}

/**
 * Extracts assignee changes from issue changelog
 *
 * @param issue - The Jira issue to analyze
 * @returns Array of changelog history items with assignee changes
 */
function getAssigneeChanges(issue: JiraIssue): JiraIssue['changelog']['histories'] {
	return issue.changelog.histories.filter((history) => history.items.some((item) => item.field === 'assignee'))
}

/**
 * Calculates penalty based on frequency of assignee changes
 *
 * @param changeCount - Number of assignee changes
 * @returns Penalty points for frequency
 */
function calculateAssigneeChangeFrequencyPenalty(changeCount: number): number {
	if (changeCount > 5) {
		return 5 // Many team handoffs
	} else if (changeCount > 3) {
		return 3
	} else if (changeCount > 2) {
		return 2
	} else if (changeCount > 1) {
		return 1
	}
	return 0
}

/**
 * Calculates penalty for back-and-forth assignee patterns
 *
 * @param assigneeChanges - Array of changelog history items with assignee changes
 * @returns Penalty points for back-and-forth patterns
 */
function calculateBackAndForthPenalty(assigneeChanges: JiraIssue['changelog']['histories']): number {
	// Extract unique assignees
	const uniqueAssignees = new Set()
	assigneeChanges.forEach((history) => {
		const assigneeItem = history.items.find((item) => item.field === 'assignee')
		if (assigneeItem && assigneeItem.toString) {
			uniqueAssignees.add(assigneeItem.toString)
		}
	})

	// If fewer unique assignees than changes, there were back-and-forth reassignments
	if (uniqueAssignees.size < assigneeChanges.length && assigneeChanges.length > 1) {
		return 2 // Penalty for ping-ponging between assignees
	}

	return 0
}
