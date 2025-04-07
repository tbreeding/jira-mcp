/**
 * Active Ratio Calculation Module
 *
 * This module provides functionality for calculating the ratio of active work time
 * to total elapsed time. This metric helps identify how much of the calendar time
 * spent on an issue was actually spent in active development.
 */
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

/**
 * Calculates the ratio of active work time to total elapsed time
 *
 * @param activeWorkPeriods - Array of active work periods
 * @param totalActiveHours - Total hours spent in active status
 * @returns Active ratio
 */
export function calculateActiveRatio(activeWorkPeriods: ActiveWorkPeriod[], totalActiveHours: number): number {
	if (activeWorkPeriods.length === 0 || totalActiveHours === 0) {
		return 0
	}

	// Get the earliest start and latest end dates
	const startDate = new Date(Math.min(...activeWorkPeriods.map((p) => new Date(p.startDate).getTime())))
	const endDate = new Date(Math.max(...activeWorkPeriods.map((p) => new Date(p.endDate).getTime())))

	// Calculate total elapsed hours
	const totalElapsedHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)

	// Calculate the ratio
	return totalElapsedHours > 0 ? totalActiveHours / totalElapsedHours : 0
}
