/**
 * Acceptance criteria evaluation functionality
 *
 * This file implements the logic for analyzing and evaluating the quality
 * and completeness of acceptance criteria within Jira issues, detecting
 * missing elements and assessing overall criteria quality.
 */

import type { CategoryCheckResult } from './completenessEvaluation.types'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Checks if acceptance criteria are present and of good quality in a Jira issue
 */
export function checkAcceptanceCriteria(allText: string, issue: JiraIssue): CategoryCheckResult {
	const acceptanceCriteriaPatterns = [
		/acceptance criteria/i,
		/given.*when.*then/i,
		/success criteria/i,
		/definition of done/i,
		/acceptance test/i,
		/should (be able to|allow)/i,
	]

	// Look for acceptance criteria in the text
	const hasPatternMatch = acceptanceCriteriaPatterns.some((pattern) => pattern.test(allText))

	// Special case: Check if there's a dedicated custom field for acceptance criteria
	// This is just an example and would need to be adapted to the actual Jira instance
	const hasCustomField = Boolean(issue.fields['customfield_10101'])

	// Determine presence and quality
	const isPresent = hasPatternMatch || hasCustomField

	let quality: 'absent' | 'partial' | 'complete' = 'absent'
	if (isPresent) {
		// Basic heuristic: If we found multiple patterns, it's more likely to be complete
		// More sophisticated analysis could look at structure and word count
		const matchCount = acceptanceCriteriaPatterns.filter((pattern) => pattern.test(allText)).length
		quality = matchCount > 2 ? 'complete' : 'partial'
	}

	return {
		missing: isPresent ? [] : ['Acceptance criteria not found'],
		present: isPresent,
		quality,
	}
}
