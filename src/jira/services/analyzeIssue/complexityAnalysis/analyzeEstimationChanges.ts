/**
 * This file analyzes estimation changes in Jira issues to evaluate complexity.
 * It tracks modifications to time estimates and story points throughout an issue's
 * lifecycle. Frequent changes to estimations often indicate uncertainty, scope changes,
 * or previously unknown complexity factors being discovered during development.
 * This analysis contributes to the overall complexity assessment of Jira issues.
 */
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Analyzes changes in estimation
 *
 * @param issue - The Jira issue to analyze
 * @returns Score and factor describing complexity from estimation changes
 */
export function analyzeEstimationChanges(issue: JiraIssue): { score: number; factor: string | null } {
	let estimationChanges = 0

	// Fields that might contain estimation information
	const estimationFields = [
		'timeoriginalestimate',
		'timeestimate',
		'customfield_10106', // Story points in many Jira instances
	]

	if (issue.changelog && issue.changelog.histories) {
		issue.changelog.histories.forEach(function (history) {
			history.items.forEach(function (item) {
				if (estimationFields.includes(item.field)) {
					estimationChanges++
				}
			})
		})
	}

	let score = 0
	if (estimationChanges > 2) {
		score = 2
	} else if (estimationChanges > 0) {
		score = 1
	}

	const factor = estimationChanges > 0 ? `Estimation changes: Estimate was adjusted ${estimationChanges} times` : null

	return { score, factor }
}
