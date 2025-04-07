/**
 * Blocked Time Assessment Module
 *
 * This module provides functionality to analyze and assess the time an issue spent in a blocked state.
 * It calculates the total duration of blocked periods, identifies the reasons for the blockages,
 * and extracts unique blocking reasons from the issue's history. This information helps teams
 * understand workflow impediments and identify patterns of blockages that may require process
 * improvements or resource allocation adjustments.
 */
import { calculateTotalBlockedDays } from './calculateTotalBlockedDays'
import { extractUniqueReasons } from './extractUniqueReasons'
import { identifyBlockedPeriods } from './identifyBlockedPeriods'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Assesses time spent in blocked status
 * @param issue The Jira issue to analyze
 * @param commentsResponse The comments associated with the issue
 * @returns Object containing blocked time assessment
 */
export function assessBlockedTime(
	issue: JiraIssue,
	commentsResponse: IssueCommentResponse,
): {
	totalDays: number
	reasons: string[]
} {
	const blockedPeriods = identifyBlockedPeriods(issue, commentsResponse)
	const totalDays = calculateTotalBlockedDays(blockedPeriods)
	const reasons = extractUniqueReasons(blockedPeriods)

	return {
		totalDays,
		reasons,
	}
}
