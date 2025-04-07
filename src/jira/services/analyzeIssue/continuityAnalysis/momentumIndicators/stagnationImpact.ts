/**
 * This file implements functionality to evaluate the impact of work stagnation on a Jira issue.
 * It analyzes various stagnation metrics (total stagnation days, longest stagnation period,
 * frequency of stagnation) to quantify how significantly work interruptions have affected
 * the issue's progress. The calculation applies penalties for different aspects of stagnation
 * to generate a score that reflects the negative impact on momentum and delivery timelines.
 * Lower scores indicate more severe stagnation problems that may require process improvements.
 */

import { calculateFrequencyPenalty } from './calculateFrequencyPenalty'
import { calculateLongestPeriodPenalty } from './calculateLongestPeriodPenalty'
import { calculateTotalDaysPenalty } from './calculateTotalDaysPenalty'
import { calculateTotalStagnationDays } from './calculateTotalStagnationDays'
import { findLongestStagnationPeriod } from './findLongestStagnationPeriod'
import type { StagnationPeriod } from '../types/continuityAnalysis.types'

/**
 * Calculates a score based on stagnation periods
 * (inversely related to stagnation - more stagnation = lower score)
 *
 * @param stagnationPeriods - The identified stagnation periods
 * @returns Stagnation impact score (1-10)
 */
export function calculateStagnationImpactScore(stagnationPeriods: StagnationPeriod[]): number {
	// If no stagnation periods, perfect score
	if (!stagnationPeriods || stagnationPeriods.length === 0) {
		return 10
	}

	// Calculate key stagnation metrics
	const totalStagnationDays = calculateTotalStagnationDays(stagnationPeriods)
	const longestStagnationDays = findLongestStagnationPeriod(stagnationPeriods)

	// Calculate score with penalties
	const baseScore = 10
	const totalDaysPenalty = calculateTotalDaysPenalty(totalStagnationDays)
	const longestPeriodPenalty = calculateLongestPeriodPenalty(longestStagnationDays)
	const frequencyPenalty = calculateFrequencyPenalty(stagnationPeriods.length)

	// Apply penalties and ensure score is between 1 and 10
	return Math.max(1, Math.min(10, baseScore - totalDaysPenalty - longestPeriodPenalty - frequencyPenalty))
}
