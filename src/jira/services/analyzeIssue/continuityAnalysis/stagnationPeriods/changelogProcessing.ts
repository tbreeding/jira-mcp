/**
 * This file provides utilities for processing and extracting information from Jira issue changelogs.
 * It offers functions to search for field changes that occurred before specific timestamps and
 * to extract field values from changelog history entries. These functions support temporal analysis
 * by enabling the system to reconstruct the state of an issue at any point in time, which is
 * essential for accurately identifying stagnation periods and tracking issue progression.
 */

import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Finds all changes to a specific field that occurred before or at the target time
 *
 * @param issue - The Jira issue
 * @param targetTime - The timestamp in milliseconds
 * @param fieldName - The name of the field to find changes for
 * @returns Sorted array of history entries containing field changes
 */
export function findFieldChangesBefore(
	issue: JiraIssue,
	targetTime: number,
	fieldName: string,
): JiraIssue['changelog']['histories'] {
	return (
		issue.changelog?.histories
			?.filter((history) => {
				const historyTime = new Date(history.created).getTime()
				return historyTime <= targetTime && history.items.some((item) => item.field === fieldName)
			})
			.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()) || []
	)
}

/**
 * Extracts field value from a changelog history entry
 *
 * @param historyEntry - The history entry containing the field change
 * @param fieldName - The name of the field to extract
 * @returns The field value string, or null if not found
 */
export function extractFieldValueFromChange(
	historyEntry: JiraIssue['changelog']['histories'][0],
	fieldName: string,
): string | null {
	const fieldItem = historyEntry.items.find((item) => item.field === fieldName)
	return fieldItem ? fieldItem.toString : null
}
