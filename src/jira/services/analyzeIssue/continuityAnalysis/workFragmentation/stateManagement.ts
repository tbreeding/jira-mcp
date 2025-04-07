/**
 * This file provides state management functionality for tracking issue status transitions.
 * It includes functions to establish initial state based on an issue's creation attributes
 * and to update state objects as changes are processed. The state tracking captures critical
 * information about current status, assignee, active state flags, and period start times.
 * This stateful approach enables the system to maintain context as it processes the issue
 * timeline and accurately identify when active work periods begin and end.
 */

import { isInitialStatusActive } from '../utils/status/isInitialStatusActive'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Gets the initial state of the issue
 *
 * @param issue - The Jira issue to analyze
 * @returns Object containing initial state information
 */
export function getInitialState(issue: JiraIssue): {
	currentDate: Date
	currentStatus: string | null
	currentAssignee: string | null
	inActiveStatus: boolean
	activePeriodStart: Date | null
} {
	const currentDate = new Date(issue.fields.created)
	const currentStatus = issue.fields.status?.name || null
	const currentAssignee = issue.fields.assignee?.displayName || null

	// Determine if the initial status is active
	const inActiveStatus = isInitialStatusActive(currentStatus)
	const activePeriodStart = inActiveStatus ? currentDate : null

	return {
		currentDate,
		currentStatus,
		currentAssignee,
		inActiveStatus,
		activePeriodStart,
	}
}

/**
 * Creates a new state object for the next iteration
 *
 * @param change - Status change being processed
 * @param currentStatus - Current issue status
 * @param currentAssignee - Current issue assignee
 * @param newInActiveStatus - Updated active status flag
 * @param newActivePeriodStart - Updated active period start
 * @returns New state object
 */
export function createNewState(
	change: {
		date: Date
		toStatus: string | null
		assignee: string | null
	},
	currentStatus: string | null,
	currentAssignee: string | null,
	newInActiveStatus: boolean,
	newActivePeriodStart: Date | null,
): {
	currentDate: Date
	currentStatus: string | null
	currentAssignee: string | null
	inActiveStatus: boolean
	activePeriodStart: Date | null
} {
	return {
		currentDate: change.date,
		currentStatus: change.toStatus || currentStatus,
		currentAssignee: change.assignee || currentAssignee,
		inActiveStatus: newInActiveStatus,
		activePeriodStart: newActivePeriodStart,
	}
}
