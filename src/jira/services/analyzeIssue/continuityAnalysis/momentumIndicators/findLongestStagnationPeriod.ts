/**
 * This file provides functionality to identify the single longest period of stagnation in a Jira issue.
 * Stagnation periods represent timeframes where no meaningful activity occurred on the issue.
 * By finding the longest continuous stagnation period, the system can highlight particularly
 * problematic delays that may require special attention. This metric is a key indicator of
 * workflow bottlenecks and is used in continuity analysis to identify improvement opportunities.
 */

import type { StagnationPeriod } from '../types/continuityAnalysis.types'

/**
 * Finds the duration of the longest stagnation period
 *
 * @param stagnationPeriods - The identified stagnation periods
 * @returns Duration of longest stagnation period in days
 */
export function findLongestStagnationPeriod(stagnationPeriods: StagnationPeriod[]): number {
	return Math.max(...stagnationPeriods.map((period) => period.durationDays))
}
