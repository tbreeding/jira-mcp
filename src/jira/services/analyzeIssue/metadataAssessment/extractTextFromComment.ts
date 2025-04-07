/**
 * Comment Text Extractor
 *
 * This utility extracts plain text content from structured Jira comment objects.
 * It handles the complex nested structure of Atlassian Document Format (ADF) comments,
 * recursively traversing content nodes to extract all text elements. The module
 * provides a consistent approach to accessing comment text regardless of its structure,
 * enabling reliable text analysis for sentiment detection, keyword extraction, and
 * other content-based evaluations used in issue metadata assessment.
 */
import type { IssueComment } from '../../../types/comment'
import type { DescriptionContentNode } from '../../../types/issue.types'

/**
 * Extracts text content from a Jira comment object
 */
export function extractTextFromComment(comment: IssueComment): string {
	if (!comment.body || !comment.body.content) {
		return ''
	}

	// Similar to description extraction
	function extractText(content: DescriptionContentNode | DescriptionContentNode[]): string {
		if (!content) return ''

		if (Array.isArray(content)) {
			return content.map(extractText).join(' ')
		}

		if (content.text) {
			return content.text
		}

		if (content.content) {
			return extractText(content.content)
		}

		return ''
	}

	return extractText(comment.body.content)
}
