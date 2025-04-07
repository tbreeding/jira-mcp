/**
 * Late-stage change detection and impact analysis
 *
 * This file implements the core functionality for detecting and analyzing changes
 * that occur late in a Jira issue's lifecycle, assessing their impact on project
 * timelines and identifying potential process improvement opportunities.
 */

import { findSignificantChangesAfter } from './changeIdentification'
import { calculateThresholdDate } from './thresholdCalculation'
import type { JiraIssue } from '../../../../types/issue.types'
import type { LateStageChange } from '../types/continuityAnalysis.types'

/**
 * Default threshold for considering a change "late stage" (70% of the way through the issue lifecycle)
 */
const DEFAULT_LATE_STAGE_THRESHOLD = 0.7

/**
 * Identifies significant changes that occurred late in the issue lifecycle
 *
 * @param issue - The Jira issue to analyze
 * @param lateStageThreshold - The percentage threshold for considering a change "late stage"
 * @returns Array of late-stage changes
 */
export function identifyLateStageChanges(
	issue: JiraIssue,
	lateStageThreshold = DEFAULT_LATE_STAGE_THRESHOLD,
): LateStageChange[] {
	// If no changelog, return empty array
	if (!issue.changelog || !issue.changelog.histories || issue.changelog.histories.length === 0) {
		return []
	}

	// Calculate the threshold date
	const thresholdDate = calculateThresholdDate(issue, lateStageThreshold)

	// Get all significant changes after the threshold date
	return findSignificantChangesAfter(issue, thresholdDate)
}
