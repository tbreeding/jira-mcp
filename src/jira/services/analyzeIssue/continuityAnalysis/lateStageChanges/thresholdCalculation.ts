/**
 * Threshold calculation for late-stage change identification
 *
 * This file provides functions for determining the threshold point in an issue's
 * lifecycle after which changes are considered "late-stage" and potentially
 * disruptive, based on issue progression and workflow patterns.
 */

import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Calculates the date that represents the late-stage threshold
 *
 * @param issue - The Jira issue
 * @param threshold - The threshold percentage (0-1)
 * @returns The threshold date
 */
export function calculateThresholdDate(issue: JiraIssue, threshold: number): Date {
	const startDate = new Date(issue.fields.created).getTime()
	const endDate =
		issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string'
			? new Date(issue.fields.resolutiondate).getTime()
			: new Date().getTime()

	const totalDuration = endDate - startDate
	const thresholdTime = startDate + totalDuration * threshold

	return new Date(thresholdTime)
}
