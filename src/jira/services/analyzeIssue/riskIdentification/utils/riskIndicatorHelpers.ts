/**
 * Helper functions for risk indicators detection
 *
 * This file provides utility functions for detecting patterns in text
 * that may indicate potential risks.
 */

/**
 * Checks a string pattern against the normalized text
 */
export function checkStringPattern(normalizedText: string, pattern: string, category: string): string | null {
	if (normalizedText.includes(pattern.toLowerCase())) {
		return `${category}: '${pattern}' found in text`
	}
	return null
}

/**
 * Checks a regex pattern against the normalized text
 */
export function checkRegexPattern(normalizedText: string, pattern: RegExp, category: string): string | null {
	const matches = normalizedText.match(pattern)
	if (matches) {
		return `${category}: Pattern match '${pattern.toString().slice(1, -1)}' found in text`
	}
	return null
}

/**
 * Determines severity level based on the number of indicators found
 */
export function determineSeverity(indicatorCount: number): 'low' | 'medium' | 'high' {
	if (indicatorCount > 5) {
		return 'high'
	} else if (indicatorCount > 2) {
		return 'medium'
	}
	return 'low'
}
