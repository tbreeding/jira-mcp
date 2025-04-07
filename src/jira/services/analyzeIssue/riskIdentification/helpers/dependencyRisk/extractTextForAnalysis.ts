/**
 * Text extraction for dependency risk analysis
 *
 * This file provides functions to extract text from Jira issues and comments
 * for dependency risk analysis.
 */

import type { IssueCommentResponse } from '../../../../../types/comment'
import type { JiraIssue } from '../../../../../types/issue.types'

/**
 * Extracts relevant text from a Jira issue and its comments for analysis
 *
 * @param issue - The Jira issue to analyze
 * @param commentsResponse - Comments related to the issue
 * @returns Combined text from issue description and comments
 */
export function extractTextForAnalysis(issue: JiraIssue, commentsResponse: IssueCommentResponse): string {
	const descriptionText = issue.fields.description || ''
	const commentsText = commentsResponse.comments.map((comment) => comment.body || '').join(' ')
	return `${descriptionText} ${commentsText}`
}
