/**
 * Time calculation utilities for flow efficiency analysis
 *
 * This file provides functions for calculating time-based metrics in flow
 * efficiency analysis, including elapsed time between events, business hours
 * calculations, and time normalization for consistent measurement.
 */

import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Calculates time between two dates in milliseconds
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Time in milliseconds
 */
export function calculateTimeBetween(startDate: Date, endDate: Date): number {
	return endDate.getTime() - startDate.getTime()
}

/**
 * Calculates time from a date to issue completion/current date
 *
 * @param issue - The Jira issue
 * @param fromDate - The starting date
 * @returns Time in milliseconds
 */
export function calculateTimeToCompletion(issue: JiraIssue, fromDate: Date): number {
	const endDate =
		issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string'
			? new Date(issue.fields.resolutiondate)
			: new Date()

	return endDate.getTime() - fromDate.getTime()
}
