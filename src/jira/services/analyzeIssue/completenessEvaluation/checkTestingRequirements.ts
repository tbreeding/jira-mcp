/**
 * Testing requirements verification functionality
 *
 * This file implements the logic for analyzing and evaluating the presence and
 * quality of testing requirements documentation within Jira issues. It assesses
 * whether test cases, scenarios, and test coverage expectations are specified.
 */

import type { CategoryCheckResult } from './completenessEvaluation.types'

/**
 * Checks if testing requirements are documented in a Jira issue
 */
export function checkTestingRequirements(allText: string): CategoryCheckResult {
	const testingPatterns = [
		/test (case|scenario)/i,
		/edge case/i,
		/test plan/i,
		/verification/i,
		/validation/i,
		/QA (step|requirement)/i,
		/test (criteria|requirement)/i,
		/automated test/i,
		/manual test/i,
	]

	// Look for testing requirements in the text
	const matchingPatterns = testingPatterns.filter((pattern) => pattern.test(allText))
	const isPresent = matchingPatterns.length > 0

	// Determine quality based on number of testing aspects mentioned
	let quality: 'absent' | 'partial' | 'complete' = 'absent'
	if (isPresent) {
		quality = matchingPatterns.length >= 3 ? 'complete' : 'partial'
	}

	return {
		missing: isPresent ? [] : ['Testing requirements not specified'],
		present: isPresent,
		quality,
	}
}
