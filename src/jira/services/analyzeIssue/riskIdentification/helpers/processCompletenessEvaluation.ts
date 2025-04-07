/**
 * Helper for processing completeness evaluation data for risk analysis
 */

import type { CompletenessEvaluation } from '../../completenessEvaluation/completenessEvaluation.types'

/**
 * Evaluate score level and add appropriate suggestions
 */
function evaluateScoreLevel(score: number, riskItems: string[], mitigationSuggestions: string[]): number {
	let additionalScore = 0

	if (score < 5) {
		riskItems.push(`Issue has low completeness score: ${score}/10`)
		additionalScore += 3
		mitigationSuggestions.push('Request clarification on missing requirements before implementation begins')
	} else if (score < 7) {
		additionalScore += 2
		mitigationSuggestions.push('Document assumptions and seek confirmation from stakeholders')
	}

	return additionalScore
}

/**
 * Process missing information items and add appropriate risk items
 */
function processMissingInformation(
	missingInformation: string[],
	riskItems: string[],
	mitigationSuggestions: string[],
	suggestions: string[],
): number {
	let additionalScore = 0

	// Take up to 3 missing information items
	const missingItems = missingInformation.slice(0, 3)
	for (const item of missingItems) {
		riskItems.push(`Missing information: ${item}`)
	}

	if (missingItems.length > 2) {
		additionalScore += 3
	} else if (missingItems.length > 0) {
		additionalScore += missingItems.length
	}

	// Add suggestions from completeness evaluation if they exist
	if (suggestions.length > 0) {
		mitigationSuggestions.push(...suggestions.slice(0, 2))
	}

	return additionalScore
}

/**
 * Process information from completeness evaluation to identify risks
 *
 * @param completenessData - The completeness evaluation data to process
 * @param riskItems - Array to append identified risk items to
 * @param mitigationSuggestions - Array to append mitigation suggestions to
 * @returns Additional risk score based on completeness evaluation
 */
export function processCompletenessEvaluation(
	completenessData: CompletenessEvaluation,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	let additionalScore = 0

	// Evaluate score level
	additionalScore += evaluateScoreLevel(completenessData.score, riskItems, mitigationSuggestions)

	// Process missing information if any
	if (completenessData.missingInformation.length > 0) {
		additionalScore += processMissingInformation(
			completenessData.missingInformation,
			riskItems,
			mitigationSuggestions,
			completenessData.suggestions,
		)
	}

	return additionalScore
}
