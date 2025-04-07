/**
 * Text extraction utility for Jira issue completeness analysis
 *
 * This file provides functionality for extracting and processing relevant text
 * from various Jira issue fields including description, comments, and custom fields,
 * preparing it for completeness evaluation and pattern detection.
 */

import { extractAllText } from '../metadataAssessment/extractAllText'
import type { IssueCommentResponse } from '../../../types/comment'
import type { JiraIssue } from '../../../types/issue.types'

/**
 * Extracts all text relevant for completeness evaluation from an issue and its comments.
 * Also looks for custom fields like acceptance criteria if they exist.
 */
export function extractRelevantText(issue: JiraIssue, commentsResponse: IssueCommentResponse): string {
	// Start with the basic text extraction used by other components
	const baseText = extractAllText(issue, commentsResponse)

	// Add any custom fields that might contain completeness information
	// This is just a placeholder - you would add actual custom field extraction here
	// based on your Jira instance configuration
	const customFields: string[] = []

	// Example: Extract acceptance criteria custom field if it exists
	if (issue.fields['customfield_10101']) {
		// This is an example field ID - would need to be adjusted for actual Jira instance
		customFields.push(String(issue.fields['customfield_10101']))
	}

	// Join all text sources
	return [baseText, ...customFields].join(' ')
}
