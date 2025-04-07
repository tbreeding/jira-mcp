/**
 * This file implements functionality to track issue context (status and assignee) at any point in time.
 * It provides functions to determine what state an issue was in at a specific timestamp by analyzing
 * the issue's changelog history. This temporal context tracking is crucial for creating accurate
 * event timelines, understanding issue state transitions, and identifying when and how long issues
 * remained in particular states, which helps detect workflow bottlenecks and process issues.
 */

import { findFieldChangesBefore, extractFieldValueFromChange } from './changelogProcessing'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Gets the status at a specific time based on changelog
 *
 * @param issue - The Jira issue
 * @param timestamp - The timestamp to check
 * @returns The status at the given time, or null if not determinable
 */
export function getCurrentStatusAtTime(issue: JiraIssue, timestamp: string): string | null {
	const targetTime = new Date(timestamp).getTime()

	// Get all status changes before the target time
	const statusChanges = findFieldChangesBefore(issue, targetTime, 'status')

	// If we have status changes before this time, get the most recent one
	if (statusChanges.length > 0) {
		return extractFieldValueFromChange(statusChanges[0], 'status')
	}

	// If no status changes, return the current status
	return issue.fields.status?.name || null
}

/**
 * Gets the assignee at a specific time based on changelog
 *
 * @param issue - The Jira issue
 * @param timestamp - The timestamp to check
 * @returns The assignee at the given time, or null if not determinable
 */
export function getCurrentAssigneeAtTime(issue: JiraIssue, timestamp: string): string | null {
	const targetTime = new Date(timestamp).getTime()

	// Get all assignee changes before the target time
	const assigneeChanges = findFieldChangesBefore(issue, targetTime, 'assignee')

	// If we have assignee changes before this time, get the most recent one
	if (assigneeChanges.length > 0) {
		return extractFieldValueFromChange(assigneeChanges[0], 'assignee')
	}

	// If no assignee changes, return the current assignee
	return issue.fields.assignee?.displayName || null
}
