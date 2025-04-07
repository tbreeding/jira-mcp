/**
 * Creation Event Processor
 *
 * This module handles the addition of issue creation events to the event timeline.
 * It extracts the creation timestamp and initial state of an issue and adds this
 * information as the first event in the timeline. Creation events are crucial for
 * establishing the starting point of issue lifecycle analysis and ensuring that
 * the period between creation and first activity is properly accounted for in
 * stagnation analysis.
 */

import type { UpdateEvent } from './eventTypes'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Adds issue creation event to the events array
 *
 * @param issue - The Jira issue
 * @param events - Array to add the event to
 */
export function addCreationEvent(issue: JiraIssue, events: UpdateEvent[]): void {
	events.push({
		date: new Date(issue.fields.created),
		status: issue.fields.status?.name || null,
		assignee: issue.fields.assignee?.displayName || null,
	})
}
