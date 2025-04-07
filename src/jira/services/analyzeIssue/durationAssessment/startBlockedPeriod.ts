/**
 * Blocked Period Initialization Module
 *
 * This utility handles the creation and initialization of blocked period records when an issue
 * transitions into a blocked state. It captures the timestamp when an issue became blocked and
 * initializes a structured representation of the blocked period with standard metadata fields.
 * The module provides a consistent approach to tracking the start of impediments, which is crucial
 * for accurate blocked time calculations and workflow efficiency analysis.
 */
import type { BlockedPeriod } from './types/durationAssessment.types'

/**
 * Handles the start of a blocked period
 * @param timestamp Timestamp when block started
 * @returns New blocked period object
 */
export function startBlockedPeriod(timestamp: string): BlockedPeriod {
	return {
		startTime: timestamp,
		endTime: null,
		reason: null,
	}
}
