/**
 * Total Active Hours Calculation Module
 *
 * This module provides functionality for calculating the total number
 * of hours spent in active work across all work periods.
 */
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

/**
 * Calculates total active hours from active work periods
 *
 * @param activeWorkPeriods - Array of active work periods
 * @returns Total active hours
 */
export function calculateTotalActiveHours(activeWorkPeriods: ActiveWorkPeriod[]): number {
	return activeWorkPeriods.reduce((total, period) => total + period.durationHours, 0)
}
