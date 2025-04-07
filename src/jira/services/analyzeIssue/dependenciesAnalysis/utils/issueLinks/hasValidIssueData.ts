/**
 * This file provides validation functionality for Jira issue data in dependency analysis.
 * It implements a utility function to verify that an issue object contains the minimum
 * required data (a key and non-empty structure) to be considered valid for processing.
 * This validation is essential for defensive programming throughout the dependency analysis
 * system, preventing errors when processing incomplete or malformed issue data from the API.
 */

import type { JiraIssue } from '../../../../../types/issue.types'

/**
 * Checks if an issue object has valid data
 */
export function hasValidIssueData(issue: Partial<JiraIssue>): boolean {
	return Boolean(issue && 'key' in issue && issue.key && Object.keys(issue).length > 0)
}
