/**
 * This file provides functionality to process and extract status changes from Jira issue changelogs.
 * It transforms raw changelog entries into structured status transition objects that include
 * critical contextual information like the timestamp, previous status, new status, and the
 * assignee at the time of the change. This chronological sequence of status transitions forms
 * the foundation for identifying active work periods and analyzing workflow patterns.
 */

import { getCurrentAssignee } from './assigneeTracking'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Extracts and sorts status changes from the issue changelog
 *
 * @param issue - The Jira issue to analyze
 * @returns Array of status changes sorted by date
 */
export function extractStatusChanges(issue: JiraIssue): Array<{
	date: Date
	fromStatus: string | null
	toStatus: string | null
	assignee: string | null
}> {
	return issue.changelog.histories
		.filter((history) => history.items && history.items.some((item) => item.field === 'status'))
		.map((history) => {
			const statusItem = history.items.find((item) => item.field === 'status')
			return {
				date: new Date(history.created),
				fromStatus: statusItem ? statusItem.fromString : null,
				toStatus: statusItem ? statusItem.toString : null,
				assignee: getCurrentAssignee(issue, history.created),
			}
		})
		.sort((a, b) => a.date.getTime() - b.date.getTime())
}
