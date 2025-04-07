/**
 * Status change analysis for flow efficiency calculation
 *
 * This file implements functionality for analyzing status transitions in Jira
 * issues, identifying active and waiting states, and calculating time spent
 * in each status to support flow efficiency metrics.
 */

import { mapHistoryToStatusChange } from './mapHistoryToStatusChange'
import { initializeState, updateState } from './stateManagement'
import { calculateTimeBetween, calculateTimeToCompletion } from './timeCalculation'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Extracts and sorts status changes from the issue changelog
 *
 * @param issue - The Jira issue
 * @returns Array of status changes sorted by date
 */
export function extractStatusChanges(issue: JiraIssue): Array<{
	date: Date
	fromStatus: string | null
	toStatus: string | null
}> {
	return issue.changelog.histories
		.filter((history) => history.items && history.items.some((item) => item.field === 'status'))
		.map(mapHistoryToStatusChange)
		.sort((a, b) => a.date.getTime() - b.date.getTime())
}

/**
 * Calculates active time based on status changes
 *
 * @param issue - The Jira issue
 * @param statusChanges - Array of status changes sorted by date
 * @returns Total active time in milliseconds
 */
export function calculateActiveTimeFromStatusChanges(
	issue: JiraIssue,
	statusChanges: Array<{
		date: Date
		fromStatus: string | null
		toStatus: string | null
	}>,
): number {
	let activeTime = 0

	// Track periods of active work
	let state = initializeState(issue)

	// Process each status change
	statusChanges.forEach((change) => {
		// If was in active status, add time up to this change
		if (state.inActiveStatus) {
			activeTime += calculateTimeBetween(state.currentDate, change.date)
		}

		// Update state
		state = updateState(change)
	})

	// Add time from last status change to resolution/current date if in active status
	if (state.inActiveStatus) {
		activeTime += calculateTimeToCompletion(issue, state.currentDate)
	}

	return activeTime
}
