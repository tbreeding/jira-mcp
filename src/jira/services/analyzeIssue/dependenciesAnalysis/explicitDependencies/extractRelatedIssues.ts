/**
 * Related Issues Extractor
 *
 * This module extracts explicitly linked issues from a Jira issue's data structure.
 * It parses the issue links section to identify relationships such as blocks, is blocked by,
 * relates to, and other link types. The module structures this information as dependency
 * objects that can be used for analyzing the issue's dependency network, identifying
 * blockers and dependencies that may impact delivery timelines and workflow.
 */
import { createLinkedIssue } from '../utils/issueLinks/createLinkedIssue'
import { isBlockerLink } from '../utils/issueLinks/isBlockerLink'
import { mapLinkToLinkedIssue } from '../utils/issueLinks/mapLinkToLinkedIssue'
import type { JiraIssue, IssueLink } from '../../../../types/issue.types'
import type { LinkedIssue } from '../types/dependencies.types'

/**
 * Extracts related (non-blocker) issues from a Jira issue's linked issues
 */
export function extractRelatedIssues(issue: JiraIssue): LinkedIssue[] {
	if (!issue.fields.issuelinks || !Array.isArray(issue.fields.issuelinks)) {
		return []
	}

	const relatedLinks = issue.fields.issuelinks.filter((link) => !isNonRelatedLink(link))

	// Handle edge case where there are links with neither inward nor outward issue
	const hasLinkWithNoDirections = issue.fields.issuelinks.some(
		(link) => link.type && !link.inwardIssue && !link.outwardIssue,
	)

	if (relatedLinks.length === 0 && hasLinkWithNoDirections) {
		return [createLinkedIssue('unknown', 'No data available', 'relates to')]
	}

	return relatedLinks.map(mapLinkToLinkedIssue)
}

/**
 * Determines if a link should be excluded from related issues
 */
export function isNonRelatedLink(link: IssueLink): boolean {
	// Skip if no type
	if (!link.type) {
		return true
	}

	// Skip if it's a blocker (handled separately)
	if (isBlockerLink(link)) {
		return true
	}

	// Skip if no linked issue in either direction
	return !link.inwardIssue && !link.outwardIssue
}
