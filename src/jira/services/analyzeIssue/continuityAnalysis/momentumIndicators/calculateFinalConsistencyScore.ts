/**
 * This file provides functionality to calculate the final consistency score for a Jira issue.
 * The consistency score represents how regularly and predictably an issue has been updated over time.
 * It applies penalties based on the coefficient of variation (indicating irregular update patterns)
 * and the update frequency (how often updates occur), resulting in a score from 1-10 where
 * higher scores indicate more consistent work patterns on the issue.
 */

import { calculateCoeffOfVariationPenalty } from './calculateCoeffOfVariationPenalty'
import { calculateUpdateFrequencyPenalty } from './calculateUpdateFrequencyPenalty'

/**
 * Calculates the final consistency score based on statistical measures
 *
 * @param coeffOfVariation - Coefficient of variation of update gaps
 * @param updatesPerDay - Average number of updates per day
 * @returns Final consistency score (1-10)
 */
export function calculateFinalConsistencyScore(coeffOfVariation: number, updatesPerDay: number): number {
	let score = 10

	// Apply penalties
	score -= calculateCoeffOfVariationPenalty(coeffOfVariation)
	score -= calculateUpdateFrequencyPenalty(updatesPerDay)

	// Ensure score is between 1 and 10
	return Math.max(1, Math.min(10, score))
}
