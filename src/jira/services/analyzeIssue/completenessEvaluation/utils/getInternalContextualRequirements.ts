/**
 * Contextual Requirements Determination for Completeness Evaluation
 *
 * This module analyzes Jira issues to determine which information categories are relevant
 * based on issue type and context. It provides a mechanism to adapt completeness evaluation
 * criteria based on the specific needs of different issue types. For example, bugs, epics,
 * and tasks each have different documentation requirements. This contextual approach ensures
 * that completeness scores are appropriate for each issue's intended purpose.
 */
import type { JiraIssue } from '../../../../types/issue.types'
import type { ContextualRequirements } from '../types/contextualRequirements.types'

/**
 * Determines which information categories are relevant based on issue type
 * Takes a simple approach focusing on issue type rather than content analysis
 *
 * @param issue - The Jira issue to analyze
 * @returns Object specifying which information categories should be evaluated
 */
export function getInternalContextualRequirements(issue: JiraIssue): ContextualRequirements {
	// Default to requiring core agile information
	const requirements: ContextualRequirements = {
		needsTechnicalConstraints: true,
		needsTestingRequirements: true,
		needsDesignSpecifications: true,
		needsUserImpact: true,
	}

	const issueType = issue.fields.issuetype.name.toLowerCase()

	// Adjust requirements based on issue type
	if (issueType === 'bug') {
		// Bugs always need testing requirements
		requirements.needsTestingRequirements = true
	} else if (issueType === 'epic') {
		// Epics focus on user value and high-level requirements, not technical details
		requirements.needsTechnicalConstraints = false
		requirements.needsTestingRequirements = false
	} else if (issueType === 'task' || issueType === 'sub-task') {
		// Most tasks need all categories evaluated as default
	}

	return requirements
}
