/**
 * This file implements functionality to identify periods of stagnation in Jira issue progress.
 * Stagnation is detected by analyzing the time gaps between consecutive issue updates and
 * identifying periods where no activity occurred for longer than a configurable threshold.
 * The function records important contextual information such as the issue status and assignee
 * during stagnation, which helps teams understand why and where delays are occurring and
 * enables data-driven process improvements to address workflow bottlenecks.
 */

import { calculateBusinessDays } from '../utils/calculateBusinessDays'
import { getAllUpdateEvents } from './eventCollection'
import { DEFAULT_STAGNATION_THRESHOLD_DAYS } from './eventTypes'
import type { JiraIssue } from '../../../../types/issue.types'
import type { StagnationPeriod } from '../types/continuityAnalysis.types'

/**
 * Identifies periods with no updates that exceed the stagnation threshold
 *
 * @param issue - The Jira issue to analyze
 * @param stagnationThresholdDays - The number of business days that constitutes stagnation
 * @returns Array of stagnation periods
 */
export function identifyStagnationPeriods(
	issue: JiraIssue,
	stagnationThresholdDays = DEFAULT_STAGNATION_THRESHOLD_DAYS,
): StagnationPeriod[] {
	// Get all update events (status changes, comments, etc.)
	const updateEvents = getAllUpdateEvents(issue)

	// If fewer than 2 events, there can't be stagnation between them
	if (updateEvents.length < 2) {
		return []
	}

	// Sort events by date
	updateEvents.sort((a, b) => a.date.getTime() - b.date.getTime())

	const stagnationPeriods: StagnationPeriod[] = []

	// Check gaps between consecutive events
	for (let i = 0; i < updateEvents.length - 1; i++) {
		const currentEvent = updateEvents[i]
		const nextEvent = updateEvents[i + 1]

		// Calculate business days between events
		const startDateStr = currentEvent.date.toISOString()
		const endDateStr = nextEvent.date.toISOString()
		const businessDays = calculateBusinessDays(startDateStr, endDateStr)

		// If exceeds threshold, add to stagnation periods
		if (businessDays >= stagnationThresholdDays) {
			stagnationPeriods.push({
				startDate: startDateStr,
				endDate: endDateStr,
				durationDays: businessDays,
				status: currentEvent.status || 'Unknown',
				assignee: currentEvent.assignee,
			})
		}
	}

	return stagnationPeriods
}
