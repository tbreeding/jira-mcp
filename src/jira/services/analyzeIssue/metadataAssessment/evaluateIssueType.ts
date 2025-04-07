/**
 * Issue Type Evaluator
 *
 * This module analyzes the content of Jira issues to determine if the assigned issue type
 * accurately reflects the actual work described. It examines issue descriptions, comments,
 * and other text elements to identify indicators of different work types (bugs, features, tasks).
 * By comparing these indicators against the assigned type, the module can detect potential
 * misclassifications. This analysis helps teams maintain accurate issue categorization,
 * which is crucial for reporting accuracy, workflow efficiency, and prioritization.
 */
import { containsBugIndicators } from './containsBugIndicators'
import { containsFeatureIndicators } from './containsFeatureIndicators'
import { containsTaskIndicators } from './containsTaskIndicators'
import { determineSuggestedIssueType } from './determineSuggestedIssueType'
import { extractAllText } from './extractAllText'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Evaluates if the issue type matches the actual work described
 */
export function evaluateIssueType(issue: JiraIssue, commentsResponse: IssueCommentResponse): string {
	const issueType = issue.fields.issuetype.name

	// Get all text content for analysis
	const allText = extractAllText(issue, commentsResponse)

	// Analyze text for keywords that indicate work type
	const hasBugIndicators = containsBugIndicators(allText)
	const hasFeatureIndicators = containsFeatureIndicators(allText)
	const hasTaskIndicators = containsTaskIndicators(allText)

	// Determine if assigned type matches content
	return determineSuggestedIssueType(issueType, hasBugIndicators, hasFeatureIndicators, hasTaskIndicators)
}
