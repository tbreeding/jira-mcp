/**
 * Helper functions for generating mitigation suggestions for technical risks
 */

import type { RiskIndicatorResult } from '../types/riskIdentification.types'

/**
 * Generates mitigation suggestions based on detected risks
 *
 * @param technicalDebtResult - Results from technical debt analysis
 * @param architectureResult - Results from architecture impact analysis
 * @param performanceResult - Results from performance concern analysis
 * @param securityResult - Results from security risk analysis
 * @returns Array of mitigation suggestions
 */
export function generateTechnicalMitigationSuggestions(
	technicalDebtResult: RiskIndicatorResult,
	architectureResult: RiskIndicatorResult,
	performanceResult: RiskIndicatorResult,
	securityResult: RiskIndicatorResult,
): string[] {
	const mitigationSuggestions: string[] = []

	if (technicalDebtResult.present) {
		mitigationSuggestions.push('Consider scheduling dedicated refactoring task following implementation')
	}

	if (architectureResult.present) {
		mitigationSuggestions.push('Schedule architecture review meeting before implementation')
	}

	if (performanceResult.present) {
		mitigationSuggestions.push('Add specific performance acceptance criteria with measurable thresholds')
	}

	if (securityResult.present) {
		mitigationSuggestions.push('Request security review from security team during implementation')
	}

	return mitigationSuggestions
}
