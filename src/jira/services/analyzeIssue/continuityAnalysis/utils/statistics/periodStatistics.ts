/**
 * Period Statistics Calculation Module
 *
 * This module provides functionality for analyzing statistical properties of work periods.
 * It calculates metrics like average duration, standard deviation, and coefficient of variation,
 * which are useful for understanding the uniformity and predictability of work patterns.
 */
import type { ActiveWorkPeriod } from '../../types/continuityAnalysis.types'

/**
 * Calculates period statistics for active work periods
 *
 * @param activeWorkPeriods - Array of active work periods
 * @returns Statistics for periods including average, standard deviation, and coefficient of variation
 */
export function calculatePeriodStatistics(activeWorkPeriods: ActiveWorkPeriod[]): {
	averagePeriodHours: number
	stdDev: number
	coeffOfVariation: number
} {
	if (activeWorkPeriods.length === 0) {
		return {
			averagePeriodHours: 0,
			stdDev: 0,
			coeffOfVariation: 0,
		}
	}

	// Calculate average period duration
	const totalHours = activeWorkPeriods.reduce((total, period) => total + period.durationHours, 0)
	const averagePeriodHours = totalHours / activeWorkPeriods.length

	// Calculate standard deviation
	const squaredDifferences = activeWorkPeriods.map((period) => {
		const diff = period.durationHours - averagePeriodHours
		return diff * diff
	})
	const variance = squaredDifferences.reduce((total, diff) => total + diff, 0) / activeWorkPeriods.length
	const stdDev = Math.sqrt(variance)

	// Calculate coefficient of variation (normalized measure of dispersion)
	const coeffOfVariation = averagePeriodHours > 0 ? stdDev / averagePeriodHours : 0

	return {
		averagePeriodHours,
		stdDev,
		coeffOfVariation,
	}
}
