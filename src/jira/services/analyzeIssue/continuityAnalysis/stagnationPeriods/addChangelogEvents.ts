/**
 * Changelog Event Processor
 *
 * This module extracts and processes changelog events from Jira issues.
 * It transforms raw changelog history entries into standardized update events that capture the
 * state of the issue (status, assignee) at each point in time. These events form the foundation
 * for stagnation period analysis by creating a chronological sequence of all meaningful issue
 * updates, which can then be analyzed to identify gaps representing periods of inactivity.
 */

import { getCurrentStatusAtTime, getCurrentAssigneeAtTime } from './contextTracking'
import type { UpdateEvent } from './eventTypes'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Adds changelog events to the events array
 *
 * @param issue - The Jira issue
 * @param events - Array to add the events to
 */
export function addChangelogEvents(issue: JiraIssue, events: UpdateEvent[]): void {
	if (!issue.changelog || !issue.changelog.histories) {
		return
	}

	issue.changelog.histories.forEach((history) => {
		events.push({
			date: new Date(history.created),
			status: getCurrentStatusAtTime(issue, history.created),
			assignee: getCurrentAssigneeAtTime(issue, history.created),
		})
	})
}
