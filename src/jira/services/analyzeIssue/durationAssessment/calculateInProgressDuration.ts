/**
 * In-Progress Duration Calculator
 *
 * This utility calculates the total duration that an issue has been in an active development state.
 * It processes the issue's status history to compute the time spent in "In Progress" or equivalent
 * states. This calculation is essential for measuring development velocity, identifying delays,
 * and providing accurate metrics on how long tasks take to complete, which can inform future
 * planning and estimation processes.
 */
import { extractStatusTransitions } from './extractStatusTransitions'
import { calculateBusinessDays } from './utils/dateUtils'
import type { StatusTransition } from './types/durationAssessment.types'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Finds the first transition to the "in progress" status category
 * @param transitions Array of status transitions
 * @returns First in-progress transition or undefined if none found
 */
function findFirstInProgressTransition(transitions: StatusTransition[]): StatusTransition | undefined {
	return transitions.find((transition) => transition.toStatusCategory === 'indeterminate')
}

/**
 * Finds the last transition to the "done" status category
 * @param transitions Array of status transitions
 * @returns Last done transition or undefined if none found
 */
function findLastDoneTransition(transitions: StatusTransition[]): StatusTransition | undefined {
	return [...transitions].reverse().find((transition) => transition.toStatusCategory === 'done')
}

/**
 * Calculate business days between two timestamps if both exist
 * @param startTime Start timestamp or null
 * @param endTime End timestamp or null
 * @returns Number of business days or null if either timestamp is missing
 */
function calculateDaysBetween(startTime: string | null, endTime: string | null): number | null {
	if (!startTime || !endTime) {
		return null
	}

	return calculateBusinessDays(startTime, endTime)
}

/**
 * Calculates the number of business days an issue was in progress
 * and identifies the first in-progress and last done timestamps
 * @param issue The Jira issue to analyze
 * @returns Object containing inProgressDays, firstInProgress and lastDone
 */
export function calculateInProgressDuration(issue: JiraIssue): {
	inProgressDays: number | null
	firstInProgress: string | null
	lastDone: string | null
} {
	const transitions = extractStatusTransitions(issue)

	// Find first transition to "in progress" and last to "done"
	const firstInProgressTransition = findFirstInProgressTransition(transitions)
	const lastDoneTransition = findLastDoneTransition(transitions)

	const firstInProgress = firstInProgressTransition?.timestamp || null
	const lastDone = lastDoneTransition?.timestamp || null

	// Calculate business days between first in progress and last done
	const inProgressDays = calculateDaysBetween(firstInProgress, lastDone)

	return {
		inProgressDays,
		firstInProgress,
		lastDone,
	}
}
