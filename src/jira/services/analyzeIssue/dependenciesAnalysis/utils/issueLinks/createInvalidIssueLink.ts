/**
 * This file provides functionality to handle invalid or incomplete Jira issue data in dependency analysis.
 * It creates standardized LinkedIssue objects for cases where the linked issue data is missing, invalid,
 * or incomplete, ensuring that the dependency analysis can proceed even with imperfect source data.
 * This functionality contributes to the robustness of the dependency detection system by gracefully
 * handling edge cases and preventing errors when processing issue links with incomplete information.
 */

import { createLinkedIssue } from './createLinkedIssue'
import type { JiraIssue } from '../../../../../types/issue.types'
import type { LinkedIssue } from '../../types/dependencies.types'

/**
 * Creates a LinkedIssue for an invalid or empty issue object
 */
export function createInvalidIssueLink(issue: Partial<JiraIssue>, relationship: string): LinkedIssue {
	const summary = Object.keys(issue).length === 0 ? 'No data available' : 'No summary available'

	return createLinkedIssue('unknown', summary, relationship)
}
