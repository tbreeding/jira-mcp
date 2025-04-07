/**
 * This file provides functionality to determine if a Jira issue is likely related to frontend/UI development.
 * It analyzes the issue's summary and description to search for UI-related terms like 'ui', 'interface',
 * 'frontend', 'screen', 'design', 'ux', and 'visual'. This helps in categorizing issues for the
 * completeness evaluation process within the issue analysis system.
 */
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Analyzes issue content to determine if it's likely frontend/UI related
 */
export function isLikelyUiRelated(issue: JiraIssue): boolean {
	const summary = issue.fields.summary?.toLowerCase() || ''
	const description =
		typeof issue.fields.description === 'string'
			? issue.fields.description.toLowerCase()
			: JSON.stringify(issue.fields.description || '').toLowerCase()

	const uiTerms = ['ui', 'interface', 'frontend', 'screen', 'design', 'ux', 'visual']

	return uiTerms.some((term) => summary.includes(term) || description.includes(term))
}
