/**
 * Utility functions for extracting text from Jira comment structures
 *
 * This file provides helper functions to parse and extract plain text
 * from Jira comments with different structure formats.
 */

import type { IssueCommentResponse } from '../../../../types/comment'

/**
 * Extracts plain text from comments, handling both string and ADF formats
 *
 * @param commentsResponse - The Jira comments response object
 * @returns A string concatenation of all comment text
 */
export function extractCommentsText(commentsResponse: IssueCommentResponse): string {
	return commentsResponse.comments
		.map((comment) => {
			// Handle the case when body might be a string or a complex ADF object
			if (typeof comment.body === 'string') {
				return comment.body
			}

			// Extract text from the complex ADF structure if present
			if (comment.body && comment.body.content) {
				return comment.body.content
					.flatMap((contentItem) => contentItem.content || [])
					.filter((item) => item.text)
					.map((item) => item.text)
					.join(' ')
			}

			return ''
		})
		.join(' ')
}
