/**
 * Issue Type Timeline Checker
 *
 * This utility analyzes the timeline of issues based on their type and identifies anomalies
 * in their duration. It implements specialized checks for different issue types like bugs and tasks,
 * comparing their actual time in progress against expected timeframes. The module helps identify
 * issues that have taken unusually long or short times to complete relative to their type,
 * which can indicate process inefficiencies or misclassified issues.
 */
import { checkBugDuration } from './checkBugDuration'
import { checkTaskDuration } from './checkTaskDuration'

/**
 * Checks if the duration is unusual for the issue type
 * @param issueType Type of the issue
 * @param inProgressDays Number of days in progress
 * @returns Array of anomaly messages
 */
export function checkIssueTypeTimeline(issueType: string, inProgressDays: number | null): string[] {
	const anomalies: string[] = []
	const lowerIssueType = issueType.toLowerCase()

	if (lowerIssueType === 'bug') {
		const bugAnomaly = checkBugDuration(inProgressDays)
		if (bugAnomaly) {
			anomalies.push(bugAnomaly)
		}
	}

	if (lowerIssueType === 'task') {
		const taskAnomaly = checkTaskDuration(inProgressDays)
		if (taskAnomaly) {
			anomalies.push(taskAnomaly)
		}
	}

	return anomalies
}
