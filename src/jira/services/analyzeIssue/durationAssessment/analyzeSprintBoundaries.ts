/**
 * This file provides functionality to analyze how Jira issues move across sprint boundaries.
 * It tracks sprint changes from the issue changelog, counting reassignments and determining
 * whether an issue exceeded its initial sprint allocation. This analysis is important for
 * identifying issues that take longer than initially estimated, potentially indicating scope
 * creep, estimation inaccuracies, or external blocking factors in the development process.
 */

import type { SprintChange } from './types/durationAssessment.types'
import type { JiraIssue, IssueChangeLogEntry } from '../../../types/issue.types'

/**
 * Processes a single history item for sprint changes
 * @param history The history entry to process
 * @returns Array of sprint changes from this history
 */
function processHistoryItem(history: IssueChangeLogEntry): SprintChange[] {
	const changes: SprintChange[] = []
	const sprintItems = history.items.filter((item) => item.field === 'Sprint')

	for (const item of sprintItems) {
		const change: SprintChange = {
			from: item.fromString ? item.fromString.split(',') : null,
			to: item.toString ? item.toString.split(',') : null,
			timestamp: history.created,
		}

		changes.push(change)
	}

	return changes
}

/**
 * Extracts sprint changes from issue history
 * @param issue The Jira issue to analyze
 * @returns Array of sprint changes
 */
function extractSprintChanges(issue: JiraIssue): SprintChange[] {
	const sprintChanges: SprintChange[] = []

	// Get all history entries
	if (!issue.changelog || !issue.changelog.histories) {
		return sprintChanges
	}

	const histories = issue.changelog.histories

	// Extract sprint changes from each history entry
	for (const history of histories) {
		const changes = processHistoryItem(history)
		sprintChanges.push(...changes)
	}

	return sprintChanges
}

/**
 * Analyzes sprint boundary crossing for an issue
 * @param issue The Jira issue to analyze
 * @returns Object containing sprint boundary analysis
 */
export function analyzeSprintBoundaries(issue: JiraIssue): {
	exceedsSprint: boolean
	sprintReassignments: number
} {
	const sprintChanges = extractSprintChanges(issue)
	const sprintReassignments = sprintChanges.length

	// Check if the issue has sprint field in fields
	let exceedsSprint = false

	if (sprintReassignments > 0) {
		exceedsSprint = true
	} else {
		// If no sprint changes but issue has sprint field, check if multiple sprints
		const sprintField = issue.fields && issue.fields.customfield_10600
		if (sprintField && Array.isArray(sprintField) && sprintField.length > 1) {
			exceedsSprint = true
		}
	}

	return {
		exceedsSprint,
		sprintReassignments,
	}
}
