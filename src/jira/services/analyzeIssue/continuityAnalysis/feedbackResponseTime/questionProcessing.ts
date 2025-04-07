/**
 * Question identification and processing in Jira comments
 *
 * This file implements the logic for identifying and analyzing questions
 * within Jira issue comments. It uses text pattern matching and natural language
 * processing techniques to detect questions requiring responses.
 */

import { getCommentText } from './textExtraction'
import { adjustForBusinessHours } from './timeCalculation'
import type { JiraComment } from './types'
import type { QuestionResponsePair } from '../../continuityAnalysis/types/continuityAnalysis.types'

/**
 * Process a potential question comment
 *
 * @param comment - The comment to process
 * @param laterComments - Comments that came after this one
 * @returns A question-response pair if found, null otherwise
 */
export function processQuestionComment(
	comment: JiraComment,
	laterComments: JiraComment[],
): QuestionResponsePair | null {
	// Check if this comment contains a question
	if (!comment.body || !isQuestionComment(getCommentText(comment.body))) {
		return null
	}

	// Look for a response from a different author
	const responseComment = findResponseComment(laterComments, comment.author?.displayName || '')

	if (!responseComment) {
		return null
	}

	// Calculate response time in hours
	const questionTime = new Date(comment.created).getTime()
	const responseTime = new Date(responseComment.created).getTime()

	// Only count business hours (approximate by excluding nights and weekends)
	const adjustedResponseTime = adjustForBusinessHours(questionTime, responseTime)

	return {
		questionTimestamp: comment.created,
		responseTimestamp: responseComment.created,
		responseTimeHours: adjustedResponseTime,
	}
}

/**
 * Checks if a comment contains a question
 *
 * @param commentText - The comment text
 * @returns Whether the comment likely contains a question
 */
function isQuestionComment(commentText: string): boolean {
	// Simple heuristic: check for question marks
	const hasQuestionMark = commentText.includes('?')

	// Check for question phrases
	const questionPhrases = [
		'can you',
		'could you',
		'would you',
		'what is',
		'what are',
		'how to',
		'how do',
		'please clarify',
		'please explain',
		'i need to know',
		'wondering if',
		'wondering how',
	]

	const hasQuestionPhrase = questionPhrases.some((phrase) => commentText.toLowerCase().includes(phrase))

	return hasQuestionMark || hasQuestionPhrase
}

/**
 * Finds the first response comment from a different author
 *
 * @param comments - The comments to search through
 * @param questionAuthor - The author of the question
 * @returns The first response comment, or null if none found
 */
function findResponseComment(comments: JiraComment[] | undefined, questionAuthor: string): JiraComment | null {
	// Guard clause for undefined or empty comments
	if (!comments || comments.length === 0) {
		return null
	}

	return comments.find((comment) => comment.author?.displayName !== questionAuthor) || null
}
