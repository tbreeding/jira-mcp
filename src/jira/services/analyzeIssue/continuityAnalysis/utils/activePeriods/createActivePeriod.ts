/**
 * Active Period Creation Module
 *
 * This module provides functionality for creating active work period objects
 * based on start and end dates, status, and assignee information.
 */
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

/**
 * Creates an active work period entry
 *
 * @param startDate - The start date of the period
 * @param endDate - The end date of the period
 * @param status - The status during the period
 * @param assignee - The assignee during the period
 * @returns An active work period object or null if duration is less than 1 hour
 */
export function createActivePeriod(
	startDate: Date,
	endDate: Date,
	status: string,
	assignee: string | null,
): ActiveWorkPeriod | null {
	const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)

	// Only count periods longer than 1 hour to filter out noise
	if (durationHours < 1) {
		return null
	}

	return {
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString(),
		durationHours,
		status: status || 'Unknown',
		assignee: assignee,
	}
}
