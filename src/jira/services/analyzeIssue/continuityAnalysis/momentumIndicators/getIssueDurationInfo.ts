/**
 * This file extracts and calculates temporal information about a Jira issue's lifecycle.
 * It determines the creation date, end date (resolution date or current date if unresolved),
 * and calculates the total duration in days. This fundamental time information serves as
 * the basis for various duration-based metrics and analyses throughout the system, including
 * momentum indicators, aging assessments, and trend analysis for issue resolution patterns.
 */

import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Gets the duration information for an issue
 *
 * @param issue - The Jira issue to analyze
 * @returns Object containing creation date, end date, and total duration in days
 */
export function getIssueDurationInfo(issue: JiraIssue): {
	creationDate: number
	endDate: number
	totalDurationDays: number
} {
	const creationDate = new Date(issue.fields.created).getTime()
	const endDate =
		issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string'
			? new Date(issue.fields.resolutiondate).getTime()
			: new Date().getTime()

	const totalDurationDays = (endDate - creationDate) / (1000 * 60 * 60 * 24)

	return { creationDate, endDate, totalDurationDays }
}
