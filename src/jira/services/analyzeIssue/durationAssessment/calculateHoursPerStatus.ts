/**
 * Status Hours Calculator
 *
 * This module calculates the number of hours an issue has spent in each workflow status.
 * It processes the issue's status transition history and computes the duration spent in
 * each state. This information is crucial for identifying workflow bottlenecks, optimizing
 * process efficiency, and providing insights into how time is distributed across different
 * stages of the development lifecycle.
 */
import { calculateHoursBetween } from './utils/dateUtils'
import type { StatusPeriod } from './types/durationAssessment.types'

/**
 * Calculates hours spent in each status based on periods
 * @param statusPeriods Array of status periods
 * @returns Record mapping status names to hours spent
 */
export function calculateHoursPerStatus(statusPeriods: StatusPeriod[]): Record<string, number> {
	const hoursInStatus: Record<string, number> = {}

	for (const period of statusPeriods) {
		const status = period.status
		const endTime = period.endTime || new Date().toISOString()
		const hours = calculateHoursBetween(period.startTime, endTime)

		// Add hours to the total for this status
		hoursInStatus[status] = (hoursInStatus[status] || 0) + hours
	}

	return hoursInStatus
}
