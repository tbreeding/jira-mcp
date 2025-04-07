/**
 * Contextual requirements determination functionality
 *
 * This file contains logic for determining which documentation requirements
 * apply to a specific Jira issue based on its type, components, and other
 * contextual factors, allowing for flexible completeness evaluation.
 */

import { isLikelyBackendRelated } from './utils/isLikelyBackendRelated'
import { isLikelyUiRelated } from './utils/isLikelyUiRelated'
import type { ContextualRequirements } from './types/contextualRequirements.types'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Determines which information categories are relevant based on issue content
 *
 * @param issue - The Jira issue to analyze
 * @returns Object specifying which information categories should be evaluated
 */
export function determineContextualRequirements(issue: JiraIssue): ContextualRequirements {
	// Default to requiring core agile information
	const requirements: ContextualRequirements = {
		needsTechnicalConstraints: true,
		needsTestingRequirements: true,
		needsDesignSpecifications: false, // Default to not requiring design specs
		needsUserImpact: true,
	}

	const issueType = issue.fields.issuetype.name.toLowerCase()
	const isUIRelated = isLikelyUiRelated(issue)
	const isBackendRelated = isLikelyBackendRelated(issue)

	// Enable design specs for UI-related issues
	if (isUIRelated) {
		requirements.needsDesignSpecifications = true
	}

	// Backend tasks don't typically need user impact documentation
	if (isBackendRelated && !isUIRelated) {
		requirements.needsUserImpact = false
	}

	// Bug-specific requirements
	if (issueType === 'bug') {
		requirements.needsTestingRequirements = true
		requirements.needsDesignSpecifications = isUIRelated
	}

	// Epic-specific requirements - focus on user value, not technical details
	if (issueType === 'epic') {
		requirements.needsTechnicalConstraints = false
		requirements.needsUserImpact = true
	}

	return requirements
}
