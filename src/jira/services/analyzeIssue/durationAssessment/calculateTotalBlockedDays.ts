/**
 * Blocked Days Calculator
 *
 * This utility calculates the total time an issue has been in a blocked state.
 * It processes a collection of blocked periods, computing the cumulative duration
 * across all blockages. This metric is crucial for understanding workflow impediments,
 * identifying patterns of delays, and quantifying the impact of blockers on delivery timelines.
 * The calculation considers both the frequency and duration of blockages to provide a comprehensive
 * view of workflow efficiency.
 */
import { calculateBusinessDays } from './utils/dateUtils'
import type { BlockedPeriod } from './types/durationAssessment.types'

/**
 * Calculate total blocked days
 * @param blockedPeriods Array of blocked periods
 * @returns Total business days in blocked status
 */
export function calculateTotalBlockedDays(blockedPeriods: BlockedPeriod[]): number {
	return blockedPeriods.reduce((total, period) => {
		const endTime = period.endTime || new Date().toISOString()
		return total + calculateBusinessDays(period.startTime, endTime)
	}, 0)
}
