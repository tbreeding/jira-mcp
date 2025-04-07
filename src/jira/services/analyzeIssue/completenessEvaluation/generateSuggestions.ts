/**
 * Improvement suggestions generation for Jira issue completeness
 *
 * This file implements the logic for generating actionable suggestions to improve
 * the completeness of Jira issues based on identified gaps in documentation,
 * providing specific recommendations for each missing or incomplete category.
 */

import { addDesignSuggestions, addUserImpactSuggestions } from './utils/advancedSuggestionHelpers'
import {
	addAcceptanceCriteriaSuggestions,
	addTechnicalConstraintSuggestions,
	addDependencySuggestions,
	addTestingSuggestions,
} from './utils/suggestionHelpers'
import type { ContextualRequirements } from './types/contextualRequirements.types'

/**
 * Generates actionable suggestions based on identified missing information
 * and the contextual requirements of the issue
 *
 * @param missingInformation - Array of missing information strings
 * @param issueType - Type of the Jira issue
 * @param contextualRequirements - Context-specific requirements for this issue
 * @returns Array of actionable suggestions
 */
export function generateSuggestions(
	missingInformation: string[],
	issueType: string,
	contextualRequirements?: ContextualRequirements,
): string[] {
	const suggestions: string[] = []

	// Use default requirements if none provided
	const requirements = contextualRequirements || {
		needsTechnicalConstraints: true,
		needsTestingRequirements: true,
		needsDesignSpecifications: true,
		needsUserImpact: true,
	}

	addAcceptanceCriteriaSuggestions(suggestions, missingInformation)
	addTechnicalConstraintSuggestions(suggestions, missingInformation, requirements)
	addDependencySuggestions(suggestions, missingInformation)
	addTestingSuggestions(suggestions, missingInformation, requirements)
	addDesignSuggestions(suggestions, missingInformation, issueType, requirements)
	addUserImpactSuggestions(suggestions, missingInformation, requirements)

	return suggestions
}
