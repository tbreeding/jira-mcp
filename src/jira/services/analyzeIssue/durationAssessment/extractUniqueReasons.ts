/**
 * Unique Blocking Reasons Extractor
 *
 * This utility identifies and extracts unique reasons why issues have been blocked during their lifecycle.
 * It processes the collection of blocked periods to eliminate duplicates and provide a consolidated
 * list of distinct blocking factors. This information is critical for identifying systemic impediments
 * to workflow, recognizing patterns in process disruptions, and implementing targeted improvements
 * to reduce future blockages and improve development efficiency.
 */
import type { BlockedPeriod } from './types/durationAssessment.types'

/**
 * Extract unique reasons from blocked periods
 * @param blockedPeriods Array of blocked periods
 * @returns Array of unique blocking reasons
 */
export function extractUniqueReasons(blockedPeriods: BlockedPeriod[]): string[] {
	const reasons: string[] = []

	for (const period of blockedPeriods) {
		if (period.reason && !reasons.includes(period.reason)) {
			reasons.push(period.reason)
		}
	}

	return reasons
}
