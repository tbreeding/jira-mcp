/**
 * Blocked Periods Identifier
 *
 * This module analyzes the history of Jira issues to identify periods when the issue was blocked.
 * It processes status transitions, flagged status changes, and comments to detect when work was
 * impeded by dependencies or other blockers. The module constructs a timeline of blocked periods,
 * capturing when issues entered and exited blocked states, which provides valuable insights into
 * workflow impediments and helps teams identify systemic bottlenecks in their development process.
 */
import { extractBlockingReasons } from './extractBlockingReasons'
import { extractStatusTransitions } from './extractStatusTransitions'
import { processBlockedTransition } from './processBlockedTransition'
import type { BlockedPeriod } from './types/durationAssessment.types'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Identifies blocked or on-hold periods
 * @param issue The Jira issue to analyze
 * @param commentsResponse The comments associated with the issue
 * @returns Array of blocked periods
 */
export function identifyBlockedPeriods(issue: JiraIssue, commentsResponse: IssueCommentResponse): BlockedPeriod[] {
	const transitions = extractStatusTransitions(issue)
	const blockedPeriods: BlockedPeriod[] = []

	// Extract all blocked periods from transitions
	let currentBlockedPeriod: BlockedPeriod | null = null

	for (const transition of transitions) {
		currentBlockedPeriod = processBlockedTransition(blockedPeriods, currentBlockedPeriod, transition)
	}

	// If we're still in a blocked period, add it
	if (currentBlockedPeriod) {
		blockedPeriods.push(currentBlockedPeriod)
	}

	// Try to find reasons in comments
	return extractBlockingReasons(blockedPeriods, commentsResponse)
}
