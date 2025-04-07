/**
 * User impact assessment functionality
 *
 * This file implements the logic for analyzing and evaluating how well a Jira issue
 * documents user impact information. It identifies whether the issue clearly explains
 * the value to users, benefits, and the expected user experience changes.
 */

import type { CategoryCheckResult } from './completenessEvaluation.types'

/**
 * Checks if user impact considerations are documented in a Jira issue
 */
export function checkUserImpact(allText: string): CategoryCheckResult {
	const userImpactPatterns = [
		/user (impact|affected|workflow)/i,
		/accessibility/i,
		/a11y/i,
		/user (group|role)/i,
		/persona/i,
		/user experience/i,
		/ux impact/i,
		/customer impact/i,
		/user (journey|path)/i,
	]

	// Look for user impact considerations in the text
	const matchingPatterns = userImpactPatterns.filter((pattern) => pattern.test(allText))
	const isPresent = matchingPatterns.length > 0

	// Determine quality based on the number of user impact aspects mentioned
	let quality: 'absent' | 'partial' | 'complete' = 'absent'
	if (isPresent) {
		quality = matchingPatterns.length >= 3 ? 'complete' : 'partial'
	}

	return {
		missing: isPresent ? [] : ['User impact considerations not documented'],
		present: isPresent,
		quality,
	}
}
