/**
 * Blocked Transition Processor
 *
 * This module processes transitions of Jira issues into and out of blocked states.
 * It analyzes each status change to determine if an issue has become blocked or unblocked,
 * and updates the issue's blocked periods accordingly. The processor handles the logic for
 * starting new blocked periods and terminating existing ones, ensuring accurate tracking
 * of when issues were impeded during their lifecycle. This information is essential for
 * calculating accurate blocked time metrics and understanding workflow impediments.
 */
import { endBlockedPeriod } from './endBlockedPeriod'
import { isBlockedStatus } from './isBlockedStatus'
import { startBlockedPeriod } from './startBlockedPeriod'
import type { BlockedPeriod, StatusTransition } from './types/durationAssessment.types'

/**
 * Process a single transition to track blocked periods
 * @param blockedPeriods Array of blocked periods
 * @param currentBlockedPeriod Current blocked period (if any)
 * @param transition The transition to process
 * @returns Updated current blocked period
 */
export function processBlockedTransition(
	blockedPeriods: BlockedPeriod[],
	currentBlockedPeriod: BlockedPeriod | null,
	transition: StatusTransition,
): BlockedPeriod | null {
	const status = transition.toStatus
	const timestamp = transition.timestamp

	if (!status) {
		return currentBlockedPeriod
	}

	const isBlocked = isBlockedStatus(status)

	if (isBlocked && !currentBlockedPeriod) {
		// Start of a blocked period
		return startBlockedPeriod(timestamp)
	}

	if (!isBlocked && currentBlockedPeriod) {
		// End of a blocked period
		const updatedPeriod = endBlockedPeriod(currentBlockedPeriod, timestamp)
		blockedPeriods.push(updatedPeriod)
		return null
	}

	return currentBlockedPeriod
}
