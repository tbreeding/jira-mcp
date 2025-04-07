/**
 * Late-stage change identification in Jira issue lifecycle
 *
 * This file implements the logic for identifying significant changes that occur
 * late in a Jira issue's lifecycle, which can impact project timelines, effort
 * estimation, and overall delivery predictability.
 */

import { getChangeDescription } from './changeDescription'
import { calculateCompletionPercentage } from './completionPercentage'
import { isSignificantField } from './significantFields'
import type { JiraIssue } from '../../../../types/issue.types'
import type { LateStageChange } from '../types/continuityAnalysis.types'

/**
 * Finds significant changes that occurred after the threshold date
 *
 * @param issue - The Jira issue
 * @param thresholdDate - The threshold date
 * @returns Array of late-stage changes
 */
export function findSignificantChangesAfter(issue: JiraIssue, thresholdDate: Date): LateStageChange[] {
	const lateChanges: LateStageChange[] = []
	const thresholdTime = thresholdDate.getTime()

	// Filter to changes after threshold
	const lateHistories = issue.changelog.histories.filter(
		(history) => new Date(history.created).getTime() >= thresholdTime,
	)

	// For each history entry
	lateHistories.forEach((history) => {
		// Look for significant field changes
		history.items.forEach((item) => {
			// Check if this is a significant field
			if (isSignificantField(item.field)) {
				// Calculate completion percentage
				const completionPercentage = calculateCompletionPercentage(issue, history.created)

				// Add to late changes list
				lateChanges.push({
					date: history.created,
					field: item.field,
					description: getChangeDescription(item),
					percentComplete: completionPercentage,
				})
			}
		})
	})

	return lateChanges
}
