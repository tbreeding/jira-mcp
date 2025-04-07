/**
 * Suggestion helper functions
 *
 * This file contains utility functions for generating different types of
 * suggestions to improve Jira issue documentation completeness.
 */

import type { ContextualRequirements } from '../types/contextualRequirements.types'

/**
 * Adds acceptance criteria suggestions if needed
 */
export function addAcceptanceCriteriaSuggestions(suggestions: string[], missingInfo: string[]): void {
	if (missingInfo.includes('Acceptance criteria not found')) {
		suggestions.push('Add specific acceptance criteria using Given/When/Then format')
		suggestions.push('Define measurable outcomes for each feature aspect')
	}
}

/**
 * Adds technical constraint suggestions if needed
 */
export function addTechnicalConstraintSuggestions(
	suggestions: string[],
	missingInfo: string[],
	contextualRequirements: ContextualRequirements,
): void {
	if (missingInfo.includes('Technical constraints not specified') && contextualRequirements.needsTechnicalConstraints) {
		suggestions.push('Specify performance requirements (e.g., expected response times)')
		suggestions.push('Document browser/device compatibility requirements')
	}
}

/**
 * Adds dependency suggestions if needed
 */
export function addDependencySuggestions(suggestions: string[], missingInfo: string[]): void {
	if (missingInfo.includes('Dependencies not identified')) {
		suggestions.push('Formally link blocking issues in Jira')
		suggestions.push('Specify external systems this implementation interacts with')
	}
}

/**
 * Adds testing requirement suggestions if needed
 */
export function addTestingSuggestions(
	suggestions: string[],
	missingInfo: string[],
	contextualRequirements: ContextualRequirements,
): void {
	if (missingInfo.includes('Testing requirements not specified') && contextualRequirements.needsTestingRequirements) {
		suggestions.push('Document key test scenarios for QA')
		suggestions.push('Identify edge cases that require specific testing')
	}
}
