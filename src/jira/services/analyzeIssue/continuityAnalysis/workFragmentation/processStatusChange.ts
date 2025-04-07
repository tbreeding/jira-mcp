/**
 * This file provides functionality to process individual status changes in a Jira issue's timeline.
 * It handles the logic for updating state context when a status transition occurs and determines
 * if the transition completes an active work period. The function acts as a state machine that
 * tracks current status information and detects significant transitions (like moving from active
 * to inactive status) that mark boundaries between work periods. This granular processing of
 * individual changes enables accurate identification of all active work periods in an issue.
 */

import { createNewState } from './stateManagement'
import { determineStateTransition } from './stateTransitionDetermination'
import type { ActiveWorkPeriod } from '../types/continuityAnalysis.types'

/**
 * Processes a single status change to update state and capture completed periods
 *
 * @param state - Current state
 * @param change - Status change to process
 * @returns Updated state and any completed period
 */
export function processStatusChange(
	state: {
		currentDate: Date
		currentStatus: string | null
		currentAssignee: string | null
		inActiveStatus: boolean
		activePeriodStart: Date | null
	},
	change: {
		date: Date
		fromStatus: string | null
		toStatus: string | null
		assignee: string | null
	},
): {
	newState: {
		currentDate: Date
		currentStatus: string | null
		currentAssignee: string | null
		inActiveStatus: boolean
		activePeriodStart: Date | null
	}
	completedPeriod: ActiveWorkPeriod | null
} {
	const { currentStatus, currentAssignee, inActiveStatus, activePeriodStart } = state

	// Determine the type of transition and get appropriate state changes
	const { newActivePeriodStart, newInActiveStatus, completedPeriod } = determineStateTransition(
		change,
		inActiveStatus,
		activePeriodStart,
		currentStatus,
		currentAssignee,
	)

	// Build and return the new state
	return {
		newState: createNewState(change, currentStatus, currentAssignee, newInActiveStatus, newActivePeriodStart),
		completedPeriod,
	}
}
