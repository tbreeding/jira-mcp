/**
 * Linked Issue Creator
 *
 * This module provides functionality for creating structured representations of linked Jira issues.
 * It extracts essential information from raw issue link data and transforms it into a standardized
 * format that can be used throughout the dependency analysis system. This abstraction shields
 * consumers from the complexities of the Jira API's issue link structure and ensures consistent
 * access to key properties like issue type, status, and relationship direction.
 */

import type { LinkedIssue } from '../../types/dependencies.types'

/**
 * Creates a LinkedIssue object with the given properties
 */
export function createLinkedIssue(key: string, summary?: string, relationship?: string): LinkedIssue {
	return {
		key,
		summary: summary || 'No summary available',
		relationship: relationship || 'related to',
	}
}
