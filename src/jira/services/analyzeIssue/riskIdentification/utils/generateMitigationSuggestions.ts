/**
 * Utility for generating risk mitigation suggestions
 *
 * This file provides functionality to generate actionable mitigation
 * suggestions based on identified risks. It maps risk indicators to
 * appropriate mitigation strategies that can help address or reduce the risks.
 */

import {
	addDependencySuggestions,
	addInformationRiskSuggestions,
	addQualityAndKnowledgeSuggestions,
	addTechnicalRiskSuggestions,
	addTimelineAndPlanningSuggestions,
} from './helpers/mitigationCategoryHandlers'

/**
 * Generates appropriate mitigation suggestions based on identified risk items
 *
 * @param riskItems - Array of identified risk statements
 * @returns Array of mitigation suggestions tailored to the risks
 */
export function generateMitigationSuggestions(riskItems: string[]): string[] {
	if (!riskItems || !riskItems.length) {
		return []
	}

	const suggestions = new Set<string>()

	// Match risk items with appropriate mitigation suggestions
	for (const risk of riskItems) {
		const riskLower = risk.toLowerCase()

		// Process each risk category
		addTechnicalRiskSuggestions(riskLower, suggestions)
		addQualityAndKnowledgeSuggestions(riskLower, suggestions)
		addTimelineAndPlanningSuggestions(riskLower, suggestions)
		addDependencySuggestions(riskLower, suggestions)
		addInformationRiskSuggestions(riskLower, suggestions)
	}

	return Array.from(suggestions)
}
