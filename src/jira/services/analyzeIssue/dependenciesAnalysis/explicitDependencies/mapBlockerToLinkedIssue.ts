/**
 * This file provides functionality to transform Jira issue links of the blocker type into
 * standardized LinkedIssue objects. It handles various edge cases in the Jira API response
 * structure, such as missing keys, empty objects, or missing inward issues. The mapping
 * ensures that regardless of the quality of the original data, a consistent LinkedIssue
 * object is produced for dependence analysis, with appropriate fallback values when needed.
 */

import { createLinkedIssue } from '../utils/issueLinks/createLinkedIssue'
import { getRelationship, getSummary } from './helpers'
import type { IssueLink } from '../../../../types/issue.types'
import type { LinkedIssue } from '../types/dependencies.types'

/**
 * Maps a blocker issue link to a LinkedIssue object
 */
export function mapBlockerToLinkedIssue(link: IssueLink): LinkedIssue {
	// Handle missing inwardIssue entirely
	if (!link.inwardIssue) {
		return createLinkedIssue('unknown', 'No data available', 'blocks')
	}

	const relationship = getRelationship(link)

	// Handle empty object
	if (!Object.keys(link.inwardIssue).length) {
		return createLinkedIssue('unknown', 'No data available', relationship)
	}

	// Handle missing key
	if (!link.inwardIssue.key) {
		return createLinkedIssue('unknown', 'No summary available', relationship)
	}

	return createLinkedIssue(link.inwardIssue.key, getSummary(link), relationship)
}
