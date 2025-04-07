/**
 * Work Fragmentation Utilities
 *
 * This module provides functionality for analyzing the fragmentation of work on Jira issues.
 * It calculates metrics related to how dispersed activity is across the issue's timeline
 * and integrates various metrics to determine a final fragmentation score.
 */

import { calculateActiveRatioPenalty } from './calculateActiveRatioPenalty'
import { calculatePeriodCountPenalty } from './calculatePeriodCountPenalty'
import { calculateUniformityPenalty } from './calculateUniformityPenalty'

/**
 * Calculates the final fragmentation score based on key metrics
 *
 * @param periodCount - Number of active work periods
 * @param activeRatio - Ratio of active to elapsed time
 * @param coeffOfVariation - Coefficient of variation for period durations
 * @returns Final fragmentation score (0-100)
 */
export function calculateFinalFragmentationScore(
	periodCount: number,
	activeRatio: number,
	coeffOfVariation: number,
): number {
	// Base score starts at 100 (best possible score)
	const baseScore = 100

	// Calculate penalties
	const periodCountPenalty = calculatePeriodCountPenalty(periodCount)
	const activeRatioPenalty = calculateActiveRatioPenalty(activeRatio)
	const uniformityPenalty = calculateUniformityPenalty(coeffOfVariation)

	// Apply penalties
	const score = baseScore - periodCountPenalty - activeRatioPenalty - uniformityPenalty

	// Ensure score is between 0 and 100
	return Math.max(0, Math.min(100, score))
}
