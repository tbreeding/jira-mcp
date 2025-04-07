/**
 * Work Period Creation from Dates Module
 *
 * This module provides functionality for creating work period objects
 * from start and end dates along with associated metadata.
 */
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

/**
 * Creates a work period object from dates and context information
 *
 * @param startDate - Period start date
 * @param endDate - Period end date
 * @param status - Status during the period
 * @param assignee - Assignee during the period
 * @returns Work period object
 */
export function createWorkPeriodFromDates(
	startDate: Date,
	endDate: Date,
	status: string,
	assignee: string | null,
): ActiveWorkPeriod {
	return {
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString(),
		durationHours: (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
		status: status,
		assignee: assignee,
	}
}
