/**
 * Issue Dates Calculation Module
 *
 * This module provides functionality for determining the start and end dates
 * of Jira issues, handling both resolved and unresolved issues appropriately.
 */
import type { JiraIssue } from '../../../../../types/issue.types'

/**
 * Calculates the start and end dates for an issue
 *
 * @param issue - The Jira issue to analyze
 * @returns Object containing start and end dates
 */
export function calculateIssueDates(issue: JiraIssue): { startDate: Date; endDate: Date } {
	const startDate = new Date(issue.fields.created)
	const endDate =
		issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string'
			? new Date(issue.fields.resolutiondate)
			: new Date()

	return { startDate, endDate }
}
