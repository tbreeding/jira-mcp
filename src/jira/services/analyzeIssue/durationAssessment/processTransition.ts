/**
 * Status Transition Processor
 *
 * This module handles the processing of individual status transitions for Jira issues.
 * It transforms raw transition data into structured period representations, tracking when
 * issues enter and exit different workflow states. The processor calculates accurate start
 * and end times for each status period, ensuring that the chronological sequence of status
 * changes is properly captured. This transformation enables precise time-in-status metrics
 * and supports detailed workflow efficiency analysis.
 */
import { createStatusPeriod } from './createStatusPeriod'
import type { StatusPeriod, StatusTransition } from './types/durationAssessment.types'

/**
 * Processes a single transition and adds a period if appropriate
 * @param periods Array of status periods
 * @param currentStatus Current status name
 * @param currentStatusCategory Current status category
 * @param startTime Period start time
 * @param transition Current transition
 * @returns Updated current status information
 */
export function processTransition(
	periods: StatusPeriod[],
	currentStatus: string | null,
	currentStatusCategory: string | null,
	startTime: string,
	transition: StatusTransition,
): { currentStatus: string | null; currentStatusCategory: string | null; startTime: string } {
	// Add previous period
	const period = createStatusPeriod(currentStatus, currentStatusCategory, startTime, transition.timestamp)
	if (period) {
		periods.push(period)
	}

	// Update current status for next period
	return {
		currentStatus: transition.toStatus,
		currentStatusCategory: transition.toStatusCategory,
		startTime: transition.timestamp,
	}
}
