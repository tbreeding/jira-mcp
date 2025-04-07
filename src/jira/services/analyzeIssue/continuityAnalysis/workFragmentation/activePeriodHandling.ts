/**
 * This file provides functionality to handle the finalization of active work periods in Jira issues.
 * It specifically deals with scenarios where an issue is still in an active state at the time of
 * analysis, ensuring that any ongoing active periods are properly captured and included in work
 * fragmentation metrics. This completion handling is essential for accurate representation of
 * work patterns, particularly for in-progress issues that have not yet reached resolution.
 */

import { createActivePeriod } from '../utils/activePeriods/createActivePeriod'
import type { JiraIssue } from '../../../../types/issue.types'
import type { ActiveWorkPeriod } from '../types/continuityAnalysis.types'

/**
 * Handles any active period still in progress at the end of processing
 *
 * @param issue - The Jira issue
 * @param state - Current state after processing all changes
 * @returns Final active period if one exists
 */
export function handleFinalActivePeriod(
	issue: JiraIssue,
	state: {
		currentStatus: string | null
		currentAssignee: string | null
		inActiveStatus: boolean
		activePeriodStart: Date | null
	},
): ActiveWorkPeriod | null {
	if (!state.inActiveStatus || !state.activePeriodStart) {
		return null
	}

	const endDate =
		issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string'
			? new Date(issue.fields.resolutiondate)
			: new Date()

	return createActivePeriod(state.activePeriodStart, endDate, state.currentStatus || 'Unknown', state.currentAssignee)
}
