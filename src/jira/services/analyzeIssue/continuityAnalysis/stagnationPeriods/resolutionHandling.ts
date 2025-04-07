/**
 * This file provides utilities for handling issue resolution events in the stagnation analysis process.
 * It includes functions to check if an issue has been resolved and to create standardized resolution
 * events. These functions support the event collection pipeline by ensuring that issue resolution is
 * properly captured as the final milestone in an issue's lifecycle, which is essential for accurate
 * timeline analysis and for distinguishing between ongoing and completed issues.
 */

import type { UpdateEvent } from './eventTypes'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Checks if an issue has a valid resolution date
 *
 * @param issue - The Jira issue
 * @returns True if the issue has a resolution date
 */
export function hasResolutionDate(issue: JiraIssue): boolean {
	return !!issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string'
}

/**
 * Creates a resolution event object
 *
 * @param issue - The Jira issue
 * @returns Resolution event object
 */
export function createResolutionEvent(issue: JiraIssue): UpdateEvent {
	return {
		date: new Date(issue.fields.resolutiondate as string),
		status: issue.fields.status?.name || null,
		assignee: issue.fields.assignee?.displayName || null,
	}
}
