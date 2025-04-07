/**
 * Comment adaptation utilities for response time analysis
 *
 * This file provides functions to adapt and transform Jira comment data
 * into structures suitable for response time analysis, extracting relevant
 * metadata and normalizing formats for consistent processing.
 */

import type { JiraComment } from './types'
import type { IssueComment } from '../../../../types/comment'

/**
 * Adapts IssueComment to JiraComment format
 *
 * @param comment - The original IssueComment
 * @returns Converted JiraComment
 */
export function adaptIssueComment(comment: IssueComment): JiraComment {
	return {
		created: comment.created instanceof Date ? comment.created.toISOString() : String(comment.created),
		body: comment.body as Record<string, unknown>,
		author: {
			displayName: comment.author?.displayName,
		},
	} as JiraComment
}
