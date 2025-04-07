/**
 * Blocker Link Detector
 *
 * This module provides functionality to identify blocking relationships between Jira issues.
 * It determines whether a link represents a blocking dependency by analyzing the link type
 * and direction. The module handles both standard Jira blocking link types and custom
 * link types that might represent blocking relationships. This detection is crucial for
 * separating blocking dependencies from other types of issue relationships.
 */

import type { IssueLink } from '../../../../../types/issue.types'

/**
 * Checks if an issue link is a blocker link
 */
export function isBlockerLink(link: IssueLink): boolean {
	if (!link.type) {
		return false
	}

	// Different Jira instances might have different naming for the relationship
	return link.type.name === 'Blocks' || link.type.name === 'Blocked by' || link.type.inward === 'is blocked by'
}
