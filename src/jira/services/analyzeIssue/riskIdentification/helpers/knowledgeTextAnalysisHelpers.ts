/**
 * Helper functions for analyzing knowledge risks from text patterns in Jira issues
 *
 * These functions process text analysis results to identify knowledge concentration
 * and specialized technology risks.
 */

import type { RiskIndicatorResult } from '../types/riskIdentification.types'

/**
 * Process knowledge concentration indicators from text analysis
 *
 * @param result - Risk indicator result from text analysis
 * @param riskItems - Array to append identified risk items to
 * @param mitigationSuggestions - Array to append mitigation suggestions to
 * @returns Risk score contribution from knowledge concentration indicators
 */
export function processKnowledgeConcentrationIndicators(
	result: RiskIndicatorResult,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	if (!result.present) {
		return 0
	}

	let score = 0

	riskItems.push(...result.indicators.map((item) => `Knowledge concentration risk: ${item.split(':')[1]}`))

	if (result.severity === 'high') {
		score += 3
		mitigationSuggestions.push('Schedule knowledge sharing sessions; document specialized components')
		mitigationSuggestions.push('Consider pair programming for knowledge distribution')
	} else if (result.severity === 'medium') {
		score += 2
		mitigationSuggestions.push('Document specialized knowledge required for this task')
	} else {
		score += 1
	}

	return score
}

/**
 * Process specialized technology indicators from text analysis
 *
 * @param result - Risk indicator result from text analysis
 * @param riskItems - Array to append identified risk items to
 * @param mitigationSuggestions - Array to append mitigation suggestions to
 * @returns Risk score contribution from specialized technology indicators
 */
export function processSpecializedTechnologyIndicators(
	result: RiskIndicatorResult,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	if (!result.present) {
		return 0
	}

	let score = 0

	riskItems.push(...result.indicators.map((item) => `Specialized technology risk: ${item.split(':')[1]}`))

	if (result.severity === 'high') {
		score += 3
		mitigationSuggestions.push('Identify team members with required specialized skills early in the process')
		mitigationSuggestions.push('Allocate time for learning/training if specialized technology is involved')
	} else if (result.severity === 'medium') {
		score += 2
		mitigationSuggestions.push('Create documentation for specialized technologies used')
	} else {
		score += 1
	}

	return score
}
