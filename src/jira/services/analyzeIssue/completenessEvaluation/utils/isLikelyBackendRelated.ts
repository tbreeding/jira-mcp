/**
 * This file provides functionality to determine if a Jira issue is likely related to backend development.
 * It analyzes the issue's summary and description to search for backend-related terms like 'api',
 * 'backend', 'database', 'server', and 'endpoint'. This helps in categorizing issues for the
 * completeness evaluation process within the issue analysis system.
 */
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Analyzes issue content to determine if it's likely backend related
 */
export function isLikelyBackendRelated(issue: JiraIssue): boolean {
	const summary = issue.fields.summary?.toLowerCase() || ''
	const description =
		typeof issue.fields.description === 'string'
			? issue.fields.description.toLowerCase()
			: JSON.stringify(issue.fields.description || '').toLowerCase()

	const backendTerms = ['api', 'backend', 'database', 'server', 'endpoint']

	return backendTerms.some((term) => summary.includes(term) || description.includes(term))
}
