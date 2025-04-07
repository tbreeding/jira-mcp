/**
 * This file provides handlers for different types of status transitions in Jira issues.
 * It implements specific logic for managing state changes when an issue transitions into or
 * out of an active status. When transitioning to active status, it records the start time;
 * when transitioning from active, it creates a completed work period using the accumulated
 * information. These handlers work together with the state machine to track work activity.
 */

import { createActivePeriod } from '../utils/activePeriods/createActivePeriod'
import type { ActiveWorkPeriod } from '../types/continuityAnalysis.types'

/**
 * Handles transition to active status
 *
 * @param date - Date of the transition
 * @returns Updated state values
 */
export function handleTransitionToActive(date: Date): {
	newInActiveStatus: boolean
	newActivePeriodStart: Date
	completedPeriod: null
} {
	return {
		newInActiveStatus: true,
		newActivePeriodStart: date,
		completedPeriod: null,
	}
}

/**
 * Handles transition from active status
 *
 * @param activePeriodStart - Start of the active period
 * @param transitionDate - Date of the transition
 * @param currentStatus - Current issue status
 * @param currentAssignee - Current issue assignee
 * @returns Updated state values with completed period
 */
export function handleTransitionFromActive(
	activePeriodStart: Date,
	transitionDate: Date,
	currentStatus: string | null,
	currentAssignee: string | null,
): {
	newInActiveStatus: boolean
	newActivePeriodStart: null
	completedPeriod: ActiveWorkPeriod | null
} {
	return {
		newInActiveStatus: false,
		newActivePeriodStart: null,
		completedPeriod: createActivePeriod(activePeriodStart, transitionDate, currentStatus || 'Unknown', currentAssignee),
	}
}
