/**
 * This file provides functionality to collect and aggregate all update events for a Jira issue.
 * It coordinates the collection of different event types (creation, changelog updates, resolution)
 * into a single chronological timeline. This comprehensive event collection is the foundation for
 * stagnation analysis, enabling the system to identify gaps between events that represent periods
 * of inactivity or blocked work, and supporting various metrics around issue progression.
 */

import { addChangelogEvents } from './addChangelogEvents'
import { addCreationEvent } from './addCreationEvent'
import { addResolutionEvent } from './addResolutionEvent'
import type { UpdateEvent } from './eventTypes'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Gets all update events from issue history
 *
 * @param issue - The Jira issue to analyze
 * @returns Array of update events with dates and context
 */
export function getAllUpdateEvents(issue: JiraIssue): UpdateEvent[] {
	const events: UpdateEvent[] = []

	// Add various types of events
	addCreationEvent(issue, events)
	addChangelogEvents(issue, events)
	addResolutionEvent(issue, events)

	return events
}
