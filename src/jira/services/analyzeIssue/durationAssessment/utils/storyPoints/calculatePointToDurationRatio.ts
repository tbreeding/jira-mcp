/**
 * Story Point to Duration Ratio Calculator
 *
 * This utility calculates the ratio between story points and actual development duration.
 * It analyzes the relationship between estimated complexity (story points) and the time
 * taken to complete an issue, providing a quantitative measure of estimation accuracy.
 * The module handles various scenarios, including issues without points or duration data,
 * and produces a normalized ratio that can be compared across different issues. This metric
 * helps teams refine their estimation practices and identify patterns of over or under-estimation.
 */
import { getStoryPoints } from './getStoryPoints'
import type { JiraIssue } from '../../../../../types/issue.types'

/**
 * @param issue The Jira issue
 * @param inProgressDays Number of days the issue was in progress
 * @returns Story points to duration ratio or null if not applicable
 */
export function calculatePointToDurationRatio(issue: JiraIssue, inProgressDays: number | null): number | null {
	// Get story points
	const storyPoints = getStoryPoints(issue)

	// If we don't have both story points and in-progress days, return null
	if (storyPoints === null || inProgressDays === null || inProgressDays === 0) {
		return null
	}

	// Calculate ratio (points per day)
	const ratio = storyPoints / inProgressDays

	// Round to 2 decimal places
	return Math.round(ratio * 100) / 100
}
