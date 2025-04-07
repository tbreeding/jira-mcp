/**
 * This file provides functionality to determine the appropriate state transitions when processing
 * status changes in a Jira issue. It evaluates whether a change represents a transition into or
 * out of an active status and delegates to the appropriate handlers. This determination logic
 * is critical for identifying the boundaries of active work periods and capturing completed periods.
 * The file acts as a decision point in the state machine that tracks issue activity over time.
 */

import { isTransitionFromActive, isTransitionToActive } from './transitionDetection'
import { handleTransitionFromActive, handleTransitionToActive } from './transitionHandlers'
import type { ActiveWorkPeriod } from '../types/continuityAnalysis.types'

/**
 * Determines state changes based on the type of status transition
 *
 * @param change - Status change being processed
 * @param inActiveStatus - Whether currently in active status
 * @param activePeriodStart - Start of active period if in one
 * @param currentStatus - Current issue status
 * @param currentAssignee - Current issue assignee
 * @returns Object containing state transition info and completed period if applicable
 */
export function determineStateTransition(
	change: {
		date: Date
		toStatus: string | null
	},
	inActiveStatus: boolean,
	activePeriodStart: Date | null,
	currentStatus: string | null,
	currentAssignee: string | null,
): {
	newInActiveStatus: boolean
	newActivePeriodStart: Date | null
	completedPeriod: ActiveWorkPeriod | null
} {
	// Check if transitioning into active status
	if (isTransitionToActive(inActiveStatus, change.toStatus)) {
		return handleTransitionToActive(change.date)
	}

	// Check if transitioning out of active status
	if (isTransitionFromActive(inActiveStatus, activePeriodStart, change.toStatus)) {
		return handleTransitionFromActive(
			activePeriodStart as Date, // We know this is non-null from the check in isTransitionFromActive
			change.date,
			currentStatus,
			currentAssignee,
		)
	}

	// No status change affecting activity
	return {
		newInActiveStatus: inActiveStatus,
		newActivePeriodStart: activePeriodStart,
		completedPeriod: null,
	}
}
