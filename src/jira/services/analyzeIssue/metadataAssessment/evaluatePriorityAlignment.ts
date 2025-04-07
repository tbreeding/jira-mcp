/**
 * Priority Alignment Evaluator
 *
 * This module analyzes issue content to determine if the assigned priority level appropriately
 * reflects the actual urgency described in the text. It scans issue descriptions and comments
 * for language indicating high or low urgency, then compares these indicators against the
 * formal priority setting. This validation helps teams maintain accurate prioritization,
 * ensuring that urgent issues receive appropriate attention and preventing priority inflation
 * that can undermine the effectiveness of the prioritization system.
 */
import { extractAllText } from './extractAllText'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Evaluates if the assigned priority matches the content
 */
export function evaluatePriorityAlignment(issue: JiraIssue, commentsResponse: IssueCommentResponse): boolean {
	const priority = issue.fields.priority.name
	const allText = extractAllText(issue, commentsResponse)

	// Check for high priority indicators in the text
	const highPriorityIndicators = [
		'urgent',
		'critical',
		'blocker',
		'serious',
		'severe',
		'production',
		'customer impact',
		'deadline',
		'asap',
		'high priority',
		'important',
		'emergency',
	]

	const containsHighPriorityLanguage = highPriorityIndicators.some((indicator) =>
		allText.toLowerCase().includes(indicator),
	)

	// Check for low priority indicators in the text
	const lowPriorityIndicators = [
		'minor',
		'trivial',
		'when possible',
		'not urgent',
		'low priority',
		'can wait',
		'nice to have',
		'eventually',
		'someday',
	]

	const containsLowPriorityLanguage = lowPriorityIndicators.some((indicator) =>
		allText.toLowerCase().includes(indicator),
	)

	// Determine if priority aligns with content
	const highPriorities = ['Highest', 'High', 'Critical', 'Blocker']
	const lowPriorities = ['Low', 'Lowest', 'Minor', 'Trivial']

	const isHighPriority = highPriorities.includes(priority)
	const isLowPriority = lowPriorities.includes(priority)

	if (isHighPriority && containsLowPriorityLanguage) {
		return false // Priority too high for content
	}

	if (isLowPriority && containsHighPriorityLanguage) {
		return false // Priority too low for content
	}

	return true // Priority appears appropriate
}
