/**
 * This file implements functionality to evaluate the consistency of progress made on a Jira issue.
 * It analyzes the pattern and frequency of updates to determine how steadily work progressed.
 * The calculation considers temporal factors like update frequency, variation in update gaps,
 * and overall issue duration to generate a consistency score. High scores indicate regular,
 * predictable work patterns, while low scores suggest erratic or interrupted progress that
 * may signal process inefficiencies or resource allocation problems.
 */

import { calculateFinalConsistencyScore } from './calculateFinalConsistencyScore'
import { calculateUpdateGaps } from './calculateUpdateGaps'
import { calculateUpdateStatistics } from './calculateUpdateStatistics'
import { getIssueDurationInfo } from './getIssueDurationInfo'
import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Calculates a score for how consistently progress was made
 *
 * @param issue - The Jira issue to analyze
 * @returns Progress consistency score (1-10)
 */
export function calculateProgressConsistencyScore(issue: JiraIssue): number {
	// If no history, return low score
	if (!issue.changelog || !issue.changelog.histories || issue.changelog.histories.length === 0) {
		return 3
	}

	// Get creation and resolution/current dates
	const { creationDate, endDate, totalDurationDays } = getIssueDurationInfo(issue)

	// If very short-lived issue (less than 3 days), assume good momentum
	if (totalDurationDays < 3) {
		return 10
	}

	// Calculate timeline and update gaps
	const { updateGaps, updates } = calculateUpdateGaps(issue, creationDate, endDate)

	// Calculate statistics to measure consistency
	const { coeffOfVariation, updatesPerDay } = calculateUpdateStatistics(updateGaps, updates, totalDurationDays)

	// Calculate final consistency score
	return calculateFinalConsistencyScore(coeffOfVariation, updatesPerDay)
}
