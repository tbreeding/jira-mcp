/**
 * Dependencies identification and verification functionality
 *
 * This file implements the logic for analyzing Jira issues to identify and
 * evaluate dependencies on other issues or external systems, ensuring that
 * all dependencies are properly documented and managed.
 */

import type { CategoryCheckResult } from './completenessEvaluation.types'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Checks if the issue has linked issues
 */
function hasLinkedIssues(issue: JiraIssue): boolean {
	return Boolean(issue.fields.issuelinks && issue.fields.issuelinks.length > 0)
}

/**
 * Checks if dependencies are mentioned in the text
 */
function hasDependencyMentions(text: string): boolean {
	const dependencyPatterns = [
		/depends on/i,
		/dependency/i,
		/dependent/i,
		/blocked by/i,
		/relies on/i,
		/prerequisite/i,
		/requires/i,
		/contingent on/i,
	]

	return dependencyPatterns.some((pattern) => pattern.test(text))
}

/**
 * Checks if explicit relationships are defined in the issue links
 */
function hasExplicitRelationships(issue: JiraIssue): boolean {
	if (!issue.fields.issuelinks || issue.fields.issuelinks.length === 0) {
		return false
	}

	return issue.fields.issuelinks.some(
		(link) =>
			link.type && (link.type.name === 'Blocks' || link.type.name === 'Depends on' || link.type.name === 'Relates to'),
	)
}

/**
 * Determines quality of dependency documentation
 */
function determineDependencyQuality(isPresent: boolean, hasExplicitLinks: boolean): 'absent' | 'partial' | 'complete' {
	if (!isPresent) {
		return 'absent'
	}

	return hasExplicitLinks ? 'complete' : 'partial'
}

/**
 * Checks if dependencies are properly documented in a Jira issue
 */
export function checkDependencies(allText: string, issue: JiraIssue): CategoryCheckResult {
	const linkedIssuesPresent = hasLinkedIssues(issue)
	const dependenciesMentioned = hasDependencyMentions(allText)
	const explicitRelationshipsPresent = hasExplicitRelationships(issue)

	// Determine presence and quality
	const isPresent = linkedIssuesPresent || dependenciesMentioned
	const quality = determineDependencyQuality(isPresent, explicitRelationshipsPresent)

	return {
		missing: isPresent ? [] : ['Dependencies not identified'],
		present: isPresent,
		quality,
	}
}
