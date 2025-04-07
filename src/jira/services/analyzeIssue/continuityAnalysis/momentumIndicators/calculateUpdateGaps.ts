/**
 * This file provides functionality to analyze the temporal patterns of updates in a Jira issue.
 * It calculates the time gaps between consecutive updates to identify work rhythm and continuity.
 * The function processes the issue changelog and important timestamps (creation, resolution)
 * to build a chronological timeline of all activities, then computes the intervals between
 * these events in days. These gaps are crucial for measuring work consistency, identifying
 * periods of inactivity, and evaluating the overall momentum of issue progression.
 */

import type { JiraIssue } from '../../../../types/issue.types'

/**
 * Calculates the gaps between consecutive updates
 *
 * @param issue - The Jira issue to analyze
 * @param creationDate - The issue creation timestamp in milliseconds
 * @param endDate - The issue resolution/current timestamp in milliseconds
 * @returns Object containing update timestamps and gaps between updates
 */
export function calculateUpdateGaps(
	issue: JiraIssue,
	creationDate: number,
	endDate: number,
): {
	updateGaps: number[]
	updates: number[]
} {
	// Get all update timestamps, sorted chronologically
	const updates = issue.changelog.histories.map((history) => new Date(history.created).getTime()).sort((a, b) => a - b)

	// Add creation date and resolution date (if exists) to the timeline
	const timeline = [creationDate, ...updates]
	if (issue.fields.resolutiondate && typeof issue.fields.resolutiondate === 'string') {
		timeline.push(endDate)
	}

	// Calculate gaps between updates (in days)
	const updateGaps = []
	for (let i = 0; i < timeline.length - 1; i++) {
		updateGaps.push((timeline[i + 1] - timeline[i]) / (1000 * 60 * 60 * 24))
	}

	return { updateGaps, updates }
}
