/**
 * Event Handling Module for Communication Analysis
 *
 * This module provides specialized functions for handling different types of communication events
 * in Jira issues. It includes functionality to process issue creation events, comment events,
 * and resolution events, extracting relevant temporal data and adding them to a chronological
 * event timeline. These event handlers are crucial for building a complete picture of
 * communication patterns throughout an issue's lifecycle for further analysis.
 */
import type { IssueCommentResponse } from '../../../../types/comment'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Adds issue creation event to the events array
 *
 * @param issue - The Jira issue
 * @param events - Array to add the event to
 */
export function addIssueCreationEvent(issue: JiraIssue, events: Date[]): void {
	events.push(new Date(issue.fields.created))
}

/**
 * Adds comment events to the events array
 *
 * @param commentsResponse - The issue's comments
 * @param events - Array to add the events to
 */
export function addCommentEvents(commentsResponse: IssueCommentResponse, events: Date[]): void {
	if (commentsResponse && commentsResponse.comments) {
		commentsResponse.comments.forEach((comment) => {
			events.push(new Date(comment.created))
		})
	}
}

/**
 * Adds resolution event to the events array if the issue is resolved
 *
 * @param issue - The Jira issue
 * @param events - Array to add the event to
 */
export function addResolutionEvent(issue: JiraIssue, events: Date[]): void {
	if (issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string') {
		events.push(new Date(issue.fields.resolutiondate))
	}
}
