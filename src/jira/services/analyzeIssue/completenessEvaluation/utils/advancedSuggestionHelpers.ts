/**
 * Advanced suggestion helper functions
 *
 * This file contains specialized utility functions for generating more complex
 * types of suggestions to improve Jira issue documentation completeness.
 */

import type { ContextualRequirements } from '../types/contextualRequirements.types'

/**
 * Adds design specification suggestions if needed
 */
export function addDesignSuggestions(
	suggestions: string[],
	missingInfo: string[],
	issueType: string,
	contextualRequirements: ContextualRequirements,
): void {
	if (missingInfo.includes('Design specifications not provided') && contextualRequirements.needsDesignSpecifications) {
		if (issueType.toLowerCase().includes('bug')) {
			suggestions.push('Include screenshots of the current behavior if UI-related')
			suggestions.push('Describe the expected visual outcome')
		} else {
			suggestions.push('Attach wireframes or design mockups')
			suggestions.push('Link to relevant design system components')
		}
	}

	// Add UI-specific suggestion
	if (missingInfo.includes('Design specifications may be required if this involves UI changes')) {
		const uiRelatedTerms = ['UI', 'Frontend', 'Interface', 'Design', 'UX', 'Visual', 'Screen']
		const isUiRelated = uiRelatedTerms.some(function (term) {
			return issueType.toLowerCase().includes(term.toLowerCase())
		})

		if (isUiRelated) {
			suggestions.push('Clarify if this issue involves UI changes and provide design specifications if needed')
		}
	}
}

/**
 * Adds user impact suggestions if needed
 */
export function addUserImpactSuggestions(
	suggestions: string[],
	missingInfo: string[],
	contextualRequirements: ContextualRequirements,
): void {
	if (missingInfo.includes('User impact considerations not documented') && contextualRequirements.needsUserImpact) {
		suggestions.push('Describe user workflows affected by this change')
		suggestions.push('Specify accessibility requirements if applicable')
	}
}
