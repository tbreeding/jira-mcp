/**
 * Issue completion percentage calculation for change analysis
 *
 * This file provides functionality to estimate the completion percentage of a
 * Jira issue at any point in its lifecycle, supporting identification of
 * late-stage changes and their impact on project delivery.
 */

import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Calculates the completion percentage at a given point in time
 *
 * @param issue - The Jira issue
 * @param timestamp - The timestamp to check
 * @returns The estimated completion percentage (0-100)
 */
export function calculateCompletionPercentage(issue: JiraIssue, timestamp: string): number {
	const startTime = new Date(issue.fields.created).getTime()
	const endTime =
		issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string'
			? new Date(issue.fields.resolutiondate).getTime()
			: new Date().getTime()
	const currentTime = new Date(timestamp).getTime()

	// Simple linear approximation of completion
	const totalDuration = endTime - startTime
	const elapsedDuration = currentTime - startTime

	// Convert to percentage and round to 2 decimal places
	return Math.round((elapsedDuration / totalDuration) * 10000) / 100
}
