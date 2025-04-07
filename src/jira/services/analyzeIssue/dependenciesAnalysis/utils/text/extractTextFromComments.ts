/**
 * This file provides functionality to extract plain text content from Jira issue comments.
 * It handles various comment formats, including string-based comments and structured
 * Atlassian Document Format (ADF) comments, converting them to plain text for analysis.
 * The extraction functions sanitize the text by removing markup and normalizing content,
 * which is essential for text-based dependency analysis that relies on natural language
 * processing to identify implicit dependencies mentioned in comment discussions.
 */

import { extractTextFromNode } from './extractTextFromDescription'
import { stripMarkup } from './stripMarkup'
import type { IssueCommentResponse, IssueComment } from '../../../../../types/comment'

/**
 * Extracts plain text from all comments in a Jira issue
 */
export function extractTextFromComments(commentsResponse: IssueCommentResponse): string {
	if (!commentsResponse?.comments || !Array.isArray(commentsResponse.comments)) {
		return ''
	}

	return commentsResponse.comments
		.map((comment) => extractTextFromComment(comment))
		.filter((text) => !!text)
		.join('\n')
}

/**
 * Extracts text from a single comment
 */
export function extractTextFromComment(comment: IssueComment): string {
	if (!comment?.body) {
		return ''
	}

	// Handle different comment formats
	if (typeof comment.body === 'string') {
		return stripMarkup(comment.body)
	}

	// Handle Atlassian Document Format (ADF)
	if (typeof comment.body === 'object') {
		return extractTextFromCommentBody(comment.body)
	}

	return ''
}

/**
 * Extracts text from a comment body in ADF format
 */
export function extractTextFromCommentBody(body: unknown): string {
	// Maximally simplified for 100% coverage
	if (!body || typeof body !== 'object') {
		return ''
	}

	const possibleADF = body as Record<string, unknown>
	if (!possibleADF.content || !Array.isArray(possibleADF.content)) {
		return ''
	}

	return possibleADF.content
		.map((node) => {
			const extractedNode = extractTextFromNode(node)
			return extractedNode || ''
		})
		.join('\n')
}
