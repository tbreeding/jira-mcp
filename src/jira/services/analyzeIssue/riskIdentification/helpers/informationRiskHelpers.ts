/**
 * Helper functions for information risk analysis
 */
import type { RiskIndicatorResult } from '../types/riskIdentification.types'

/**
 * Process requirements gap indicators from text analysis
 */
export function processRequirementsGapIndicators(
	result: RiskIndicatorResult,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	if (!result.present) {
		return 0
	}

	let score = 0

	riskItems.push(...result.indicators.map((item) => `Requirements gap: ${item.split(':')[1]}`))

	if (result.severity === 'high') {
		score += 3
		mitigationSuggestions.push('Request clarification on missing requirements before implementation begins')
	} else if (result.severity === 'medium') {
		score += 2
		mitigationSuggestions.push('Document open questions and get answers before implementation')
	} else {
		score += 1
	}

	return score
}

/**
 * Process ambiguity indicators from text analysis
 */
export function processAmbiguityIndicators(
	result: RiskIndicatorResult,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	if (!result.present) {
		return 0
	}

	let score = 0

	riskItems.push(...result.indicators.map((item) => `Ambiguity issue: ${item.split(':')[1]}`))

	if (result.severity === 'high') {
		score += 3
		mitigationSuggestions.push('Document assumptions and seek confirmation from stakeholders')
	} else if (result.severity === 'medium') {
		score += 2
		mitigationSuggestions.push('Identify and document all assumptions being made')
	} else {
		score += 1
	}

	return score
}

/**
 * Check if issue has a description and apply risk score accordingly
 */
export function checkForMissingDescription(
	descriptionText: string | null | undefined,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	if (!descriptionText || (typeof descriptionText === 'string' && !descriptionText.trim())) {
		riskItems.push('Issue has no description')
		mitigationSuggestions.push('Request complete description and requirements before proceeding')
		return 3
	}

	return 0
}
