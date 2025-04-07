/**
 * Previous dependency data analysis
 *
 * This file provides functions to analyze dependency information
 * from previous analyses.
 */

import type { Dependencies } from '../../../dependenciesAnalysis/types/dependencies.types'

interface PreviousDependencyAnalysisResult {
	riskItems: string[]
	mitigationSuggestions: string[]
	scoreIncrease: number
}

/**
 * Analyzes previous dependency data to enhance risk assessment
 *
 * @param dependencies - Previous dependency analysis data
 * @returns Analysis results with identified risks, mitigation suggestions and score increase
 */
export function analyzePreviousDependencies(dependencies?: Dependencies): PreviousDependencyAnalysisResult {
	const riskItems: string[] = []
	const mitigationSuggestions: string[] = []
	let scoreIncrease = 0

	if (!dependencies) {
		return { riskItems, mitigationSuggestions, scoreIncrease }
	}

	// Check for actual linked blockers
	if (dependencies.blockers && dependencies.blockers.length > 0) {
		const blockerCount = dependencies.blockers.length
		riskItems.push(`Issue has ${blockerCount} linked blocker issue${blockerCount > 1 ? 's' : ''}`)
		scoreIncrease += Math.min(blockerCount * 2, 4) // Max 4 points for blockers
		mitigationSuggestions.push('Address blocking issues before starting implementation')
	}

	// Check for external dependencies
	if (dependencies.externalDependencies && dependencies.externalDependencies.length > 0) {
		const externalCount = dependencies.externalDependencies.length
		riskItems.push(`Issue has ${externalCount} external dependencies identified`)
		scoreIncrease += Math.min(externalCount, 3) // Max 3 points for external dependencies
	}

	return {
		riskItems,
		mitigationSuggestions,
		scoreIncrease,
	}
}
