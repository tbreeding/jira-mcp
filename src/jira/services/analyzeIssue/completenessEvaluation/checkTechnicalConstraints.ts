/**
 * Technical constraints verification functionality
 *
 * This file implements the logic for analyzing and evaluating the presence and
 * quality of technical constraints documentation within Jira issues. It detects
 * patterns indicative of architecture, performance, and security requirements.
 */

import type { CategoryCheckResult } from './completenessEvaluation.types'

/**
 * Checks if technical constraints are documented in a Jira issue
 */
export function checkTechnicalConstraints(allText: string): CategoryCheckResult {
	const technicalConstraintPatterns = [
		/technical (constraints|limitations|requirements)/i,
		/performance (requirements|expectations)/i,
		/browser (support|compatibility)/i,
		/device (support|compatibility)/i,
		/environment (requirements|setup)/i,
		/dependencies/i,
		/version (requirements|compatibility)/i,
		/security requirements/i,
	]

	// Look for technical constraints in the text
	const matchingPatterns = technicalConstraintPatterns.filter((pattern) => pattern.test(allText))
	const isPresent = matchingPatterns.length > 0

	// Determine quality based on number of constraint types mentioned
	let quality: 'absent' | 'partial' | 'complete' = 'absent'
	if (isPresent) {
		quality = matchingPatterns.length >= 3 ? 'complete' : 'partial'
	}

	return {
		missing: isPresent ? [] : ['Technical constraints not specified'],
		present: isPresent,
		quality,
	}
}
