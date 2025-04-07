/**
 * This file provides functionality to extract dependency information from inward issue links.
 * It handles the specific case of extracting data from issues that block the current issue
 * (i.e., the current issue is dependent on them). The function ensures proper data extraction
 * even in cases of incomplete or invalid data by leveraging validation utilities and fallback
 * mechanisms. This extraction is critical for identifying upstream dependencies in the issue graph.
 */

import { getSummary } from '../../explicitDependencies/helpers'
import { createInvalidIssueLink } from './createInvalidIssueLink'
import { createLinkedIssue } from './createLinkedIssue'
import { hasValidIssueData } from './hasValidIssueData'
import type { IssueLink, JiraIssue } from '../../../../../types/issue.types'
import type { LinkedIssue } from '../../types/dependencies.types'
/**
 * Extracts a LinkedIssue from an inward issue link
 */
export function extractFromInwardIssue(link: IssueLink): LinkedIssue | null {
	if (!link.inwardIssue) {
		return null
	}

	const relationship = link.type?.inward || 'related to'

	// Handle empty object or missing key
	if (!hasValidIssueData(link.inwardIssue as JiraIssue)) {
		return createInvalidIssueLink(link.inwardIssue as JiraIssue, relationship)
	}

	const summary = getSummary(link)

	return createLinkedIssue(link.inwardIssue.key, summary, relationship)
}
