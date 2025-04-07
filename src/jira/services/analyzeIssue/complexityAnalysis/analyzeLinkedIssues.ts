/**
 * This file analyzes linked issues and subtasks in Jira issues to assess complexity.
 * It counts the number of subtasks and linked issues to determine the relationship
 * complexity of the issue. Issues with many relationships typically indicate a complex
 * task that requires coordination across multiple work items or dependencies.
 * This analysis contributes to the overall complexity assessment of Jira issues.
 */
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Counts the number of subtasks in the issue
 */
function countSubtasks(issue: JiraIssue): number {
	if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
		return issue.fields.subtasks.length
	}
	return 0
}

/**
 * Counts the number of linked issues
 */
function countLinkedIssues(issue: JiraIssue): number {
	if (issue.fields.issuelinks && issue.fields.issuelinks.length > 0) {
		return issue.fields.issuelinks.length
	}
	return 0
}

/**
 * Calculates complexity score based on total related issues
 */
function calculateRelatedIssuesScore(totalRelatedIssues: number): number {
	if (totalRelatedIssues > 8) {
		return 3
	}

	if (totalRelatedIssues > 4) {
		return 2
	}

	if (totalRelatedIssues > 0) {
		return 1
	}

	return 0
}

/**
 * Creates a descriptive factor about related issues
 */
function createRelatedIssuesFactor(subtaskCount: number, linkedIssueCount: number): string | null {
	const totalRelatedIssues = subtaskCount + linkedIssueCount

	if (totalRelatedIssues === 0) {
		return null
	}

	return `Related issues: ${subtaskCount} subtasks and ${linkedIssueCount} linked issues`
}

/**
 * Analyzes the number of subtasks and linked issues
 *
 * @param issue - The Jira issue to analyze
 * @returns Score and factor describing the complexity from linked issues
 */
export function analyzeLinkedIssues(issue: JiraIssue): { score: number; factor: string | null } {
	const subtaskCount = countSubtasks(issue)
	const linkedIssueCount = countLinkedIssues(issue)
	const totalRelatedIssues = subtaskCount + linkedIssueCount

	const score = calculateRelatedIssuesScore(totalRelatedIssues)
	const factor = createRelatedIssuesFactor(subtaskCount, linkedIssueCount)

	return { score, factor }
}
