/**
 * Question-response pair identification for communication analysis
 *
 * This file provides functionality for identifying and analyzing question-response
 * pairs in Jira issue comments. It matches questions with their corresponding
 * responses and calculates relevant metrics for communication assessment.
 */

import { adaptIssueComment } from './commentAdaptation'
import { processComments } from './commentProcessing'
import type { JiraComment } from './types'
import type { IssueCommentResponse } from '../../../../types/comment'
import type { QuestionResponsePair } from '../../continuityAnalysis/types/continuityAnalysis.types'

/**
 * Identifies pairs of questions and their responses in comments
 *
 * @param commentsResponse - The issue's comments
 * @returns Array of question-response pairs with response times
 */
export function identifyQuestionResponsePairs(commentsResponse: IssueCommentResponse): QuestionResponsePair[] {
	const pairs: QuestionResponsePair[] = []

	// If no comments, return empty array
	if (!commentsResponse || !commentsResponse.comments || commentsResponse.comments.length < 2) {
		return pairs
	}

	// Convert and sort comments chronologically
	const adaptedComments: JiraComment[] = commentsResponse.comments.map(adaptIssueComment)
	adaptedComments.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())

	return processComments(adaptedComments)
}
