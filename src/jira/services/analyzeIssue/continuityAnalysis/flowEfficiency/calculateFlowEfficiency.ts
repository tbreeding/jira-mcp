/**
 * Flow efficiency calculation for Jira workflow analysis
 *
 * This file implements the core algorithm for calculating flow efficiency
 * in Jira issues, measuring the ratio of active work time to total cycle time
 * to assess process efficiency and identify bottlenecks.
 */

import { calculateActiveWorkTime } from './activeTimeCalculation'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Calculates flow efficiency as the ratio of active work time to total elapsed time
 *
 * @param issue - The Jira issue
 * @returns The flow efficiency as a percentage
 */
export function calculateFlowEfficiency(issue: JiraIssue): number {
	// Get creation and completion/current dates
	const creationDate = new Date(issue.fields.created)

	// If resolved, use resolution date; otherwise use current date
	const completionDate =
		issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string'
			? new Date(issue.fields.resolutiondate)
			: new Date()

	// Calculate total elapsed time in milliseconds
	const totalElapsedTime = completionDate.getTime() - creationDate.getTime()

	// If no elapsed time (should be rare), return 0
	if (totalElapsedTime <= 0) {
		return 0
	}

	// Calculate active work time by analyzing status history
	const activeWorkTime = calculateActiveWorkTime(issue)

	// Calculate and return flow efficiency as a percentage
	const flowEfficiency = (activeWorkTime / totalElapsedTime) * 100

	// Cap at 100% and ensure it's not negative
	return Math.min(Math.max(flowEfficiency, 0), 100)
}
