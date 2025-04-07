/**
 * Status Period Creator
 *
 * This utility creates structured representations of time periods that an issue spends in a specific
 * workflow status. It takes transition timestamps and status information to generate period objects
 * that capture the start and end points of each state in the issue's lifecycle. These period objects
 * form the foundation for duration calculations, timeline visualizations, and workflow analytics
 * that help teams optimize their processes and identify bottlenecks.
 */
import type { StatusPeriod } from './types/durationAssessment.types'

/**
 * Creates a status period from current status information
 * @param currentStatus Current status name
 * @param currentStatusCategory Current status category
 * @param startTime Period start time
 * @param endTime Period end time
 * @returns Status period object
 */
export function createStatusPeriod(
	currentStatus: string | null,
	currentStatusCategory: string | null,
	startTime: string,
	endTime: string | null,
): StatusPeriod | null {
	if (!currentStatus) {
		return null
	}

	return {
		status: currentStatus,
		statusCategory: currentStatusCategory || 'unknown',
		startTime,
		endTime,
	}
}
