/**
 * Field Updates Processing Module for Communication Analysis
 *
 * This module identifies and processes significant field updates in Jira issues
 * as part of communication analysis. It filters through issue changelog histories
 * to identify updates to important fields such as description, summary, priority,
 * and labels. These field updates represent meaningful communication touchpoints
 * that contribute to the overall communication timeline of an issue.
 */
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Adds field update events to the events array
 *
 * @param issue - The Jira issue
 * @param events - Array to add the events to
 */
export function addFieldUpdateEvents(issue: JiraIssue, events: Date[]): void {
	if (!issue.changelog || !issue.changelog.histories) {
		return
	}

	issue.changelog.histories.forEach((history) => {
		if (isImportantFieldUpdate(history)) {
			events.push(new Date(history.created))
		}
	})
}

/**
 * Checks if a changelog history entry contains updates to important fields
 *
 * @param history - The changelog history entry
 * @returns True if it contains important field updates
 */
function isImportantFieldUpdate(history: JiraIssue['changelog']['histories'][0]): boolean {
	return (
		history.items &&
		history.items.some(
			(item) =>
				item.field === 'description' ||
				item.field === 'summary' ||
				item.field === 'priority' ||
				item.field === 'labels',
		)
	)
}
