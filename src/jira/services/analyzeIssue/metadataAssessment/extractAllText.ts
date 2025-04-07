/**
 * Text Content Extractor
 *
 * This utility consolidates all textual content from a Jira issue into a single string.
 * It extracts and combines text from the issue summary, description, and all comments,
 * handling different text formats and structures. The consolidated text provides a
 * comprehensive corpus for content analysis, keyword detection, and semantic evaluation.
 * This extraction is fundamental for various metadata assessments that need to analyze
 * the full context of an issue's documentation.
 */
import { extractTextFromComment } from './extractTextFromComment'
import { extractTextFromDescription } from './extractTextFromDescription'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Helper function to extract all text from an issue and its comments
 */
export function extractAllText(issue: JiraIssue, commentsResponse: IssueCommentResponse): string {
	const summary = issue.fields.summary
	const descriptionText = extractTextFromDescription(issue.fields.description)
	const commentsText = commentsResponse.comments.map((comment) => extractTextFromComment(comment)).join(' ')

	return `${summary} ${descriptionText} ${commentsText}`
}
