/**
 * This file provides functionality to extract explicitly defined blocker dependencies from Jira issues.
 * It identifies issue links of the "blocker" type and transforms them into standardized LinkedIssue
 * objects for further analysis. Blockers represent dependencies that prevent an issue from progressing
 * until they are resolved, making them critical path items in project planning and delivery forecasting.
 * Explicit blockers are those formally defined through Jira's issue linking functionality.
 */

import { isBlockerLink } from '../utils/issueLinks/isBlockerLink'
import { mapBlockerToLinkedIssue } from './mapBlockerToLinkedIssue'
import type { JiraIssue } from '../../../../types/issue.types'
import type { LinkedIssue } from '../types/dependencies.types'

/**
 * Extracts blocker issues from a Jira issue's linked issues
 */
export function extractBlockers(issue: JiraIssue): LinkedIssue[] {
	if (!issue.fields.issuelinks || !Array.isArray(issue.fields.issuelinks)) {
		return []
	}

	return issue.fields.issuelinks
		.filter((link) => {
			// Skip if no type or no inward issue
			if (!link.type || !link.inwardIssue) {
				return false
			}

			return isBlockerLink(link)
		})
		.map(mapBlockerToLinkedIssue)
}
