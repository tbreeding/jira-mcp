/**
 * Helper functions for analyzing timeline risks from text patterns in Jira issues
 *
 * These functions process text analysis results to identify timeline constraints
 * and estimation concerns.
 */

import type { RiskIndicatorResult } from '../types/riskIdentification.types'

/**
 * Process timeline constraint indicators from text analysis
 *
 * @param result - Risk indicator result from text analysis
 * @param riskItems - Array to append identified risk items to
 * @param mitigationSuggestions - Array to append mitigation suggestions to
 * @returns Risk score contribution from timeline indicators
 */
export function processTimelineConstraintIndicators(
	result: RiskIndicatorResult,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	if (!result.present) {
		return 0
	}

	let score = 0

	riskItems.push(...result.indicators.map((item) => `Timeline constraint: ${item.split(':')[1]}`))

	if (result.severity === 'high') {
		score += 3
		mitigationSuggestions.push('Consider breaking issue into smaller, more manageable sub-tasks')
		mitigationSuggestions.push('Identify critical path tasks and prioritize accordingly')
	} else if (result.severity === 'medium') {
		score += 2
		mitigationSuggestions.push('Create detailed timeline with key milestones and dependencies')
	} else {
		score += 1
	}

	return score
}

/**
 * Process estimation concern indicators from text analysis
 *
 * @param result - Risk indicator result from text analysis
 * @param riskItems - Array to append identified risk items to
 * @param mitigationSuggestions - Array to append mitigation suggestions to
 * @returns Risk score contribution from estimation indicators
 */
export function processEstimationConcernIndicators(
	result: RiskIndicatorResult,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	if (!result.present) {
		return 0
	}

	let score = 0

	riskItems.push(...result.indicators.map((item) => `Estimation concern: ${item.split(':')[1]}`))

	if (result.severity === 'high') {
		score += 3
		mitigationSuggestions.push('Review and possibly adjust story point estimation before committing')
	} else if (result.severity === 'medium') {
		score += 2
		mitigationSuggestions.push('Consider re-estimation with team input')
	} else {
		score += 1
	}

	return score
}
