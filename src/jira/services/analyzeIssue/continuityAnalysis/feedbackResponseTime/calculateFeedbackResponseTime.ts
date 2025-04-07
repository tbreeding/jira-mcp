/**
 * Feedback response time calculation for Jira issues
 *
 * This file implements the logic for calculating the average time between
 * questions and responses in Jira issue comments. It helps identify
 * communication effectiveness and responsiveness in issue handling.
 */

import { identifyQuestionResponsePairs } from './questionResponsePairs'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { QuestionResponsePair } from '../../continuityAnalysis/types/continuityAnalysis.types'

/**
 * Calculates the average time between questions and their responses in comments
 *
 * @param commentsResponse - The issue's comments
 * @returns The average response time in hours
 */
export function calculateFeedbackResponseTime(commentsResponse: IssueCommentResponse): number {
	// Identify question-response pairs
	const questionResponsePairs = identifyQuestionResponsePairs(commentsResponse)

	// If no pairs found, return 0
	if (questionResponsePairs.length === 0) {
		return 0
	}

	// Calculate average response time
	const totalResponseTime = questionResponsePairs.reduce(
		(sum: number, pair: QuestionResponsePair) => sum + pair.responseTimeHours,
		0,
	)

	return totalResponseTime / questionResponsePairs.length
}
