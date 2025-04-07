/**
 * Text-based dependency risk analysis
 *
 * This file provides functions to analyze text for dependency-related risks.
 */

import { DEPENDENCY_PATTERNS, EXTERNAL_DEPENDENCY_PATTERNS } from '../../patterns/dependencyPatterns'
import { detectRiskIndicators } from '../../utils/detectRiskIndicators'

interface TextAnalysisResult {
	riskItems: string[]
	mitigationSuggestions: string[]
	scoreIncrease: number
}

/**
 * Processes a risk indicator result and updates analysis data
 */
function processRiskIndicator(
	result: ReturnType<typeof detectRiskIndicators>,
	prefix: string,
	highSuggestions: string[],
	mediumSuggestion: string,
): { items: string[]; suggestions: string[]; score: number } {
	const items: string[] = []
	const suggestions: string[] = []
	let score = 0

	if (result && result.present) {
		items.push(...result.indicators.map((item) => `${prefix} risk: ${item.split(':')[1]}`))

		if (result.severity === 'high') {
			score += 3
			suggestions.push(...highSuggestions)
		} else if (result.severity === 'medium') {
			score += 2
			suggestions.push(mediumSuggestion)
		} else {
			score += 1
		}
	}

	return { items, suggestions, score }
}

/**
 * Analyzes text for dependency-related risks
 *
 * @param text - The text to analyze
 * @returns Analysis results with identified risks, mitigation suggestions and score increase
 */
export function analyzeTextDependencies(text: string): TextAnalysisResult {
	const safeText = text || ''
	const riskItems: string[] = []
	const mitigationSuggestions: string[] = []
	let scoreIncrease = 0

	// Check for direct dependency mentions in text
	const dependencyResult = detectRiskIndicators(safeText, DEPENDENCY_PATTERNS, 'Dependency Risk')
	const dependencyAnalysis = processRiskIndicator(
		dependencyResult,
		'Dependency',
		['Consider reordering implementation to mitigate blocking dependencies'],
		'Document dependencies clearly and track them closely throughout development',
	)

	// Check for external dependency mentions in text
	const externalDependencyResult = detectRiskIndicators(
		safeText,
		EXTERNAL_DEPENDENCY_PATTERNS,
		'External Dependency Risk',
	)
	const externalAnalysis = processRiskIndicator(
		externalDependencyResult,
		'External dependency',
		[
			'Establish clear communication channels with dependent teams',
			'Set up regular coordination meetings with teams owning dependencies',
		],
		'Document external dependencies and create escalation paths',
	)

	// Combine results
	riskItems.push(...dependencyAnalysis.items, ...externalAnalysis.items)
	mitigationSuggestions.push(...dependencyAnalysis.suggestions, ...externalAnalysis.suggestions)
	scoreIncrease += dependencyAnalysis.score + externalAnalysis.score

	return {
		riskItems,
		mitigationSuggestions,
		scoreIncrease,
	}
}
