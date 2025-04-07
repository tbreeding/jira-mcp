/**
 * This file analyzes component touchpoints in Jira issues to assess complexity.
 * It evaluates the number of components associated with an issue to determine
 * cross-component complexity. When multiple components are involved, it indicates
 * the issue spans multiple parts of the system, which typically increases complexity.
 * The analysis contributes to the overall complexity score for issue assessment.
 */
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Analyzes component/system touchpoints
 *
 * @param issue - The Jira issue to analyze
 * @returns Score and factor describing complexity from component touchpoints
 */
export function analyzeComponentTouchpoints(issue: JiraIssue): { score: number; factor: string | null } {
	const components = issue.fields.components || []
	const componentCount = components.length

	let score = 0
	if (componentCount > 3) {
		score = 3
	} else if (componentCount > 1) {
		score = 2
	} else if (componentCount > 0) {
		score = 1
	}

	const factor = componentCount > 0 ? `Component touchpoints: Issue affects ${componentCount} components/systems` : null

	return { score, factor }
}
