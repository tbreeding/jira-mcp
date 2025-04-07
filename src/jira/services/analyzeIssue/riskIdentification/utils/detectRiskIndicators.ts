/**
 * Utility function for detecting risk indicators in text
 *
 * This file provides functionality to analyze text for patterns
 * indicating potential risks in various categories. It helps identify
 * keywords and phrases that suggest technical debt, testing concerns,
 * security issues, and other risk factors.
 */

import { checkStringPattern, checkRegexPattern, determineSeverity } from './riskIndicatorHelpers'
import type { RiskIndicatorResult } from '../types/riskIdentification.types'

/**
 * Default result for invalid inputs or no matches
 */
const defaultResult = {
	present: false,
	indicators: [],
	severity: 'low' as const,
}

/**
 * Checks if input parameters are valid for processing
 */
function hasValidInputs(text: unknown, patterns: unknown): boolean {
	return typeof text === 'string' && !!text && Array.isArray(patterns) && !!patterns && patterns.length > 0
}

/**
 * Process patterns against text to find indicators
 */
function findMatchingIndicators(normalizedText: string, patterns: Array<string | RegExp>, category: string): string[] {
	const foundIndicators: string[] = []

	for (const pattern of patterns) {
		let indicator: string | null = null

		if (typeof pattern === 'string') {
			indicator = checkStringPattern(normalizedText, pattern, category)
		} else {
			indicator = checkRegexPattern(normalizedText, pattern, category)
		}

		if (indicator) {
			foundIndicators.push(indicator)
		}
	}

	return foundIndicators
}

/**
 * Detects specific patterns in text that indicate potential risks
 *
 * @param text - The text to analyze (from description, comments, etc.)
 * @param patterns - Array of regex patterns or keywords to search for
 * @param category - Risk category name for context
 * @returns Detection result with presence, found indicators, and severity
 */
export function detectRiskIndicators(
	text: string,
	patterns: Array<string | RegExp>,
	category: string,
): RiskIndicatorResult {
	// Handle invalid inputs
	if (!hasValidInputs(text, patterns)) {
		return defaultResult
	}

	const normalizedText = text.toLowerCase()
	const foundIndicators = findMatchingIndicators(normalizedText, patterns, category)
	const severity = determineSeverity(foundIndicators.length)

	return {
		present: foundIndicators.length > 0,
		indicators: foundIndicators,
		severity,
	}
}
