/**
 * This file provides functionality to capture the resolution event of a Jira issue.
 * It identifies resolved issues and adds their resolution timestamp to the timeline
 * of events. The resolution event represents the endpoint of the issue lifecycle,
 * marking the completion of work and enabling accurate measurement of the full
 * timeline from creation to resolution for closed issues.
 */

import { hasResolutionDate, createResolutionEvent } from './resolutionHandling'
import type { UpdateEvent } from './eventTypes'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Adds resolution event to the events array if the issue is resolved
 *
 * @param issue - The Jira issue
 * @param events - Array to add the event to
 */
export function addResolutionEvent(issue: JiraIssue, events: UpdateEvent[]): void {
	// Early return if no resolution date
	if (!hasResolutionDate(issue)) {
		return
	}

	// Create and add resolution event
	events.push(createResolutionEvent(issue))
}
