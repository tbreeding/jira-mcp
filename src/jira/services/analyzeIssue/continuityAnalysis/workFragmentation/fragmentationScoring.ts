/**
 * This file implements functionality to score the fragmentation of work on Jira issues.
 * It calculates a quantitative measure of work continuity based on the number, duration,
 * and distribution of active work periods. The scoring algorithm considers factors like
 * the ratio of active time to elapsed time, the variation in period durations, and the
 * total number of discrete work periods to produce a score that reflects workflow efficiency.
 */

import { calculateFinalFragmentationScore } from '../utils/fragmentationUtils'
import { calculateActiveRatio } from '../utils/statistics/activeRatio'
import { calculateTotalActiveHours } from '../utils/statistics/calculateTotalActiveHours'
import { calculatePeriodStatistics } from '../utils/statistics/periodStatistics'
import type { ActiveWorkPeriod } from '../types/continuityAnalysis.types'

/**
 * Calculates fragmentation score based on work periods
 *
 * @param activeWorkPeriods - Array of active work periods
 * @returns Fragmentation score
 */
export function calculateFragmentationScore(activeWorkPeriods: ActiveWorkPeriod[]): number {
	// If no active periods, return maximum fragmentation
	if (activeWorkPeriods.length === 0) {
		return 100
	}

	// Calculate total active hours
	const totalActiveHours = calculateTotalActiveHours(activeWorkPeriods)

	// Get period statistics
	const periodStats = calculatePeriodStatistics(activeWorkPeriods)

	// Calculate active ratio
	const activeRatio = calculateActiveRatio(activeWorkPeriods, totalActiveHours)

	// Calculate the final fragmentation score
	return calculateFinalFragmentationScore(activeWorkPeriods.length, activeRatio, periodStats.coeffOfVariation)
}
