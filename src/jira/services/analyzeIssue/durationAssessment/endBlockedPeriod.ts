/**
 * Blocked Period Termination Handler
 *
 * This utility handles the termination of blocked periods in an issue's lifecycle.
 * It processes the end of a blocked state, capturing the timestamp and details of when
 * and why the blockage was resolved. This information is critical for calculating blocked time
 * metrics, analyzing resolution patterns, and identifying effective unblocking strategies.
 * The module ensures accurate tracking of workflow impediments to support process improvement efforts.
 */
import type { BlockedPeriod } from './types/durationAssessment.types'

/**
 * Blocked Period Termination Handler
 *
 * This utility handles the termination of blocked periods in an issue's lifecycle.
 * It processes the end of a blocked state, capturing the timestamp and details of when
 * and why the blockage was resolved. This information is critical for calculating blocked time
 * metrics, analyzing resolution patterns, and identifying effective unblocking strategies.
 * The module ensures accurate tracking of workflow impediments to support process improvement efforts.
 * @param currentBlockedPeriod Current blocked period object
 * @param timestamp Timestamp when block ended
 * @returns Updated blocked period with end time
 */
export function endBlockedPeriod(currentBlockedPeriod: BlockedPeriod, timestamp: string): BlockedPeriod {
	return {
		...currentBlockedPeriod,
		endTime: timestamp,
	}
}
