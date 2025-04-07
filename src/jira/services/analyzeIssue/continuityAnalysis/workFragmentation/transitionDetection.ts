/**
 * This file provides utilities for detecting transitions between active and inactive statuses in Jira issues.
 * It contains functions that determine if a status change represents a meaningful transition that should
 * trigger the creation, continuation, or completion of an active work period. These detection functions
 * form a critical part of the state machine logic that identifies discrete periods of active work by
 * evaluating each status change in the context of the issue's current activity state.
 */

import { isActiveStatus } from '../utils/isActiveStatus'

/**
 * Checks if the status change represents a transition to active status
 *
 * @param inActiveStatus - Whether currently in active status
 * @param newStatus - The new status
 * @returns True if transitioning to active
 */
export function isTransitionToActive(inActiveStatus: boolean, newStatus: string | null): boolean {
	return !inActiveStatus && !!newStatus && isActiveStatus(newStatus)
}

/**
 * Checks if the status change represents a transition from active status
 *
 * @param inActiveStatus - Whether currently in active status
 * @param activePeriodStart - Start of active period if in one
 * @param newStatus - The new status
 * @returns True if transitioning from active
 */
export function isTransitionFromActive(
	inActiveStatus: boolean,
	activePeriodStart: Date | null,
	newStatus: string | null,
): boolean {
	return inActiveStatus && !!activePeriodStart && !!newStatus && !isActiveStatus(newStatus)
}
