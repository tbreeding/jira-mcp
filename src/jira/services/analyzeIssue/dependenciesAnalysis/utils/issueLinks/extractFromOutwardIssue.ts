/**
 * This file provides functionality to extract dependency information from outward issue links.
 * It handles the specific case of extracting data from issues that are blocked by the current issue
 * (i.e., they are dependent on the current issue). The function ensures proper data extraction
 * even in cases of incomplete or invalid data by leveraging validation utilities and fallback
 * mechanisms. This extraction helps identify downstream dependencies in the issue relationship graph.
 */

import { getSummary } from '../../explicitDependencies/helpers'
import { createInvalidIssueLink } from './createInvalidIssueLink'
import { createLinkedIssue } from './createLinkedIssue'
import { hasValidIssueData } from './hasValidIssueData'
import type { IssueLink, JiraIssue } from '../../../../../types/issue.types'
import type { LinkedIssue } from '../../types/dependencies.types'

/**
 * Extracts a LinkedIssue from an outward issue link
 */
export function extractFromOutwardIssue(link: IssueLink): LinkedIssue | null {
	if (!link.outwardIssue) return null

	const relationship = link.type?.outward || 'related to'

	// Handle empty object or missing key
	if (!hasValidIssueData(link.outwardIssue as Partial<JiraIssue>)) {
		return createInvalidIssueLink(link.outwardIssue as Partial<JiraIssue>, relationship)
	}

	const summary = getSummary(link)

	return createLinkedIssue(link.outwardIssue.key, summary, relationship)
}
