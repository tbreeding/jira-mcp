/**
 * This file implements functionality to identify active work periods in a Jira issue's lifecycle.
 * It processes the chronological sequence of status changes to detect transitions into and out of
 * active statuses. When a status changes from active to inactive, it completes an active period.
 * The function maintains state throughout the processing to track the current status context and
 * accumulates discrete periods of active work, which are critical for fragmentation analysis.
 */

import { handleFinalActivePeriod } from './activePeriodHandling'
import { processStatusChange } from './processStatusChange'
import type { JiraIssue } from '../../../../types/issue.types'
import type { ActiveWorkPeriod } from '../types/continuityAnalysis.types'

/**
 * Processes status changes to identify active work periods
 *
 * @param issue - The Jira issue to analyze
 * @param statusChanges - Array of status changes sorted by date
 * @param initialState - Initial state of the issue
 * @returns Array of active work periods
 */
export function processStatusChangesToFindActivePeriods(
	issue: JiraIssue,
	statusChanges: Array<{
		date: Date
		fromStatus: string | null
		toStatus: string | null
		assignee: string | null
	}>,
	initialState: {
		currentDate: Date
		currentStatus: string | null
		currentAssignee: string | null
		inActiveStatus: boolean
		activePeriodStart: Date | null
	},
): ActiveWorkPeriod[] {
	const activeWorkPeriods: ActiveWorkPeriod[] = []
	let state = { ...initialState }

	// Process each status change
	statusChanges.forEach((change) => {
		// Process a single status change
		const result = processStatusChange(state, change)

		// If an active period was completed, add it to our list
		if (result.completedPeriod) {
			activeWorkPeriods.push(result.completedPeriod)
		}

		// Update state for next iteration
		state = result.newState
	})

	// Handle any active period still in progress at the end
	const finalPeriod = handleFinalActivePeriod(issue, state)
	if (finalPeriod) {
		activeWorkPeriods.push(finalPeriod)
	}

	return activeWorkPeriods
}
