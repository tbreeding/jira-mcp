/**
 * Helper functions for analyzing complexity-related risks in Jira issues
 *
 * These functions help identify risks stemming from high complexity that may
 * require specialized knowledge or skills.
 */

/**
 * Process complexity analysis from previous results
 *
 * @param complexityLevel - Complexity level from previous analysis
 * @param riskItems - Array to append identified risk items to
 * @param mitigationSuggestions - Array to append mitigation suggestions to
 * @returns Risk score contribution from complexity analysis
 */
export function processComplexityAnalysis(
	complexityLevel: string | undefined,
	riskItems: string[],
	mitigationSuggestions: string[],
): number {
	if (complexityLevel === 'very complex') {
		riskItems.push('Issue is rated as very complex, suggesting specialized knowledge required')
		mitigationSuggestions.push('Ensure complex components are well-documented')
		return 2
	}

	return 0
}
