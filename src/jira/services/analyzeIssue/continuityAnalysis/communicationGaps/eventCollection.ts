/**
 * Communication Event Collection Module for Jira Issue Analysis
 *
 * This module provides functionality to collect all communication events related to a Jira issue.
 * It aggregates various types of events including issue creation, comments, resolution events,
 * and field updates into a chronological timeline. This comprehensive collection of communication
 * touchpoints is essential for analyzing communication patterns, identifying gaps, and
 * evaluating the overall communication health of an issue throughout its lifecycle.
 */
import { addCommentEvents, addIssueCreationEvent, addResolutionEvent } from './eventHandling'
import { addFieldUpdateEvents } from './fieldUpdates'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Gets all communication events from issue history
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - The issue's comments
 * @returns Array of communication event dates
 */
export function getAllCommunicationEvents(issue: JiraIssue, commentsResponse: IssueCommentResponse): Date[] {
	const events: Date[] = []

	// Add issue creation
	addIssueCreationEvent(issue, events)

	// Add comments
	addCommentEvents(commentsResponse, events)

	// Add resolution date if resolved
	addResolutionEvent(issue, events)

	// Add description and other important field updates
	addFieldUpdateEvents(issue, events)

	return events
}
