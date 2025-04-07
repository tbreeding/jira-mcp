/**
 * This file provides functionality to calculate the total number of days an issue has been stagnant.
 * Stagnation periods represent timeframes where no meaningful activity occurred on a Jira issue.
 * The function aggregates all stagnation periods to determine the total duration in days,
 * which is an important metric for understanding work interruptions and delays in issue resolution.
 * This calculation feeds into overall momentum and continuity analysis for issue tracking.
 */

import type { StagnationPeriod } from '../types/continuityAnalysis.types'

/**
 * Calculates the total duration of all stagnation periods
 *
 * @param stagnationPeriods - The identified stagnation periods
 * @returns Total stagnation days
 */
export function calculateTotalStagnationDays(stagnationPeriods: StagnationPeriod[]): number {
	return stagnationPeriods.reduce((sum, period) => sum + period.durationDays, 0)
}
