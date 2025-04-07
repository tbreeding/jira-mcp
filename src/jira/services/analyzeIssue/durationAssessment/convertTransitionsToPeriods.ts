/**
 * Status Transition to Period Converter
 *
 * This utility transforms a chronological list of status transitions into distinct time periods
 * for each status. It processes the raw transition data to create a structured representation
 * of when an issue entered and exited each workflow state. This conversion is essential for
 * accurate time-in-status calculations, providing the foundation for metrics like cycle time,
 * lead time, and status-specific durations that help teams optimize their workflow.
 */
import { createStatusPeriod } from './createStatusPeriod'
import { processTransition } from './processTransition'
import type { StatusPeriod, StatusTransition } from './types/durationAssessment.types'

/**
 * Converts transitions to status periods
 * @param transitions Array of status transitions
 * @returns Array of status periods
 */
export function convertTransitionsToPeriods(transitions: StatusTransition[]): StatusPeriod[] {
	if (transitions.length === 0) {
		return []
	}

	const statusPeriods: StatusPeriod[] = []
	let currentStatus = transitions[0].toStatus
	let currentStatusCategory = transitions[0].toStatusCategory
	let startTime = transitions[0].timestamp

	// Process all transitions into periods
	for (let i = 1; i < transitions.length; i++) {
		const transition = transitions[i]
		const result = processTransition(statusPeriods, currentStatus, currentStatusCategory, startTime, transition)

		currentStatus = result.currentStatus
		currentStatusCategory = result.currentStatusCategory
		startTime = result.startTime
	}

	// Add the last period if the issue is still in a status
	const finalPeriod = createStatusPeriod(currentStatus, currentStatusCategory, startTime, null)
	if (finalPeriod) {
		statusPeriods.push(finalPeriod)
	}

	return statusPeriods
}
